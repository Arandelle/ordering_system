import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Orders";
import { Product } from "@/models/Product";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// Correct IP's from maya docs
// https://developers.maya.ph/reference/receive-real-time-payment-information-using-webhooks

const MAYA_ALLOWED_IPS: Record<string, string[]> = {
  sandbox: ["13.229.160.234", "3.1.199.75"],
  production: ["18.138.50.235", "3.1.207.200"],
};

// Maya's current webhook events (use these, NOT the deprecated CHECKOUT_* events)
// Deprecated: CHECKOUT_SUCCESS, CHECKOUT_FAILURE, CHECKOUT_DROPOUT, CHECKOUT_CANCELLED
const PAYMENT_STATUS_MAP: Record<string, string> = {
  PAYMENT_SUCCESS: "paid",
  PAYMENT_FAILED: "failed",
  PAYMENT_EXPIRED: "expired",
  PAYMENT_CANCELLED: "cancelled",
  AUTHORIZED: "authorized", // Card payments only (hold/capture flow)
};

function getClientIP(request: NextRequest): string {
  // Vercel / most cloud providers forward the real IP via x-forwarded-for
  const forwarded = request.headers.get("x-forwareded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isAllowedIP(ip: string): boolean {
  // Skip IP check in local development
  // Add MAYA_SKIP_CHECK=true in env.local only
  if (process.env.MAYA_SKIP_CHECK === "true") {
    console.log("[MAYA Webhook] : IP check skipped - dev mode only");
    return true;
  }

  const env = process.env.NODE_ENV === "production" ? "production" : "sandbox";
  return MAYA_ALLOWED_IPS[env].includes(ip);
}

export async function POST(request: NextRequest) {
  // Step 1: IP whitelisting
  // Maya does not use HMAC signatures - security is purely IP-based.

  const clientIP = getClientIP(request);

  if (!isAllowedIP(clientIP)) {
    console.warn(`[Maya Webhook] Blocked unauthorized IP: ${clientIP}`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Step 2: Respond 2xx immediately
  // Maya requires a fast 2xx response. If it doesn't get one, it will retry:
  // → immediately → 5 min → 15 min → 45 min (max 4 retries total)
  // After that, Maya marks the event as failed and stops retrying.
  const ack = NextResponse.json({ received: true }, { status: 200 });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    // Step 3: parse payload
    const body = await request.json();
    console.log("[Maya Webhook] Full payload:", JSON.stringify(body, null, 2));

    const {
      id: paymentId,
      status: paymentStatus,
      requestReferenceNumber,
      fundSource,
    } = body;

    if (!paymentStatus || !requestReferenceNumber) {
      console.error("[Maya Webhook] Missing required fields", {
        paymentStatus,
        requestReferenceNumber,
      });
      return ack; // Still 200 — we received it, we just can't process it
    }

    const orderStatus = PAYMENT_STATUS_MAP[paymentStatus];

    if (!orderStatus) {
      // Could be a 3DS event (3DS_PAYMENT_SUCCESS, etc.) or RECURRING_*
      // Log it but don't crash
      console.warn(`[Maya Webhook] Unhandled paymentStatus: ${paymentStatus}`);
      return ack;
    }

    // ✅ Step 4: Idempotency check
    // Maya may send the same event multiple times (retries or manual re-trigger from dashboard)
    const existingOrder = await Order.findOne({
      "paymentInfo.referenceNumber": requestReferenceNumber,
    });

    if (!existingOrder) {
      console.error(
        `[Maya Webhook] No order found for referenceNumber: ${requestReferenceNumber}`,
      );
      return ack;
    }

    const finalStatuses = ["paid", "failed", "expired", "cancelled"];
    if (finalStatuses.includes(existingOrder.status)) {
      console.log(
        `[Maya Webhook] ⏭️ Skipping — order already in final state: ${existingOrder.status}`,
      );
      return ack;
    }

    // ✅ Step 5: Update the order
    await Order.findOneAndUpdate(
      { "paymentInfo.referenceNumber": requestReferenceNumber },
      {
        $set: {
          status: orderStatus,
          "paymentInfo.paymentId": paymentId ?? null,
          "paymentInfo.paymentStatus": paymentStatus,
          // Timeline tracking per status
          ...(orderStatus === "paid" && { "timeline.paidAt": new Date() }),
          ...(orderStatus === "failed" && { "timeline.failedAt": new Date() }),
          ...(orderStatus === "expired" && {
            "timeline.expiredAt": new Date(),
          }),
          ...(orderStatus === "cancelled" && {
            "timeline.cancelledAt": new Date(),
          }),
        },
      },
    );

    console.log(
      `[Maya Webhook] ✅ Order ${requestReferenceNumber} → ${orderStatus}`,
    );

    // in your webhook, after updating order status
    const shouldRestoreStock = ["failed", "expired", "cancelled"].includes(
      orderStatus,
    );

    if (shouldRestoreStock) {
      // restore stock for each item
      for (const item of existingOrder.items) {
        await Product.findByIdAndUpdate(
          item.productId, // ← you need productId in OrderItemSchema for this!
          { $inc: { stock: item.quantity } },
          { session },
        );
      }
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("[Maya Webhook] Unexpected error:", error);
    // Still 200 — don't let Maya retry on our own bug
    return ack;
  }
}
