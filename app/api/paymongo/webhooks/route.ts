import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Orders";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signatureHeader = request.headers.get("paymongo-signature");
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (webhookSecret && signatureHeader) {
      const signatureParts = signatureHeader.split(",");
      const timestampPart = signatureParts.find((part) =>
        part.startsWith("t="),
      );
      const signaturePart = signatureParts.find((part) =>
        part.startsWith("te="),
      );

      if (timestampPart && signaturePart) {
        const timestamp = timestampPart.split("=")[1];
        const signature = signaturePart.split("=")[1];

        const signedPayload = `${timestamp}.${body}`;
        const computedSignature = crypto
          .createHmac("sha256", webhookSecret)
          .update(signedPayload)
          .digest("hex");

        if (computedSignature !== signature) {
          console.log("Invalid webhook signature");
          return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 },
          );
        }

        console.log("Signature verified successfully!");
      }
    }

    const event = JSON.parse(body);
    console.log("Webhook Event Type: ", event.data.attributes.type);

    if (event.data.attributes.type === "link.payment.paid") {
      const paymentData = event.data.attributes.data;
      const attributes = paymentData.attributes;
      const payment = attributes.payments?.[0]?.data?.attributes;

      const billing = payment?.billing;

      // Payment Info
      const referenceNumber = attributes.reference_number;
      const method = payment?.source?.type ?? "N/A";
      const paidAt = payment?.paid_at
        ? new Date(payment.paid_at * 1000)
        : new Date();

      console.log("Payment successful! Reference:", referenceNumber);

      const customerName = billing?.name ?? "N/A";
      const customerEmail = billing?.email ?? "N/A";
      const customerPhone = billing?.phone ?? "N/A";

      // Update the order in DB
      await connectDB();
      const updatedOrder = await Order.findOneAndUpdate(
        { "paymentInfo.referenceNumber": referenceNumber },
        {
          $set: {
            status: "paid",
            "paymentInfo.method": method,
            "paymentInfo.paidAt": paidAt,
            "paymentInfo.customerName": customerName,
            "paymentInfo.customerEmail": customerEmail,
            "paymentInfo.customerPhone": customerPhone,
          },
        },
        { new: true },
      );

      if (!updatedOrder) {
        console.log("Order not found for reference:", referenceNumber);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      console.log("Order updated successfully:", updatedOrder._id);

      return NextResponse.json({
        received: true,
        message: "Payment processed successfully",
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
