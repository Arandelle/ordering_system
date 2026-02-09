// app/api/webhooks/paymongo/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signatureHeader = request.headers.get("paymongo-signature");
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    console.log("Webhook Secret:", webhookSecret?.substring(0, 15) + "...");
    console.log("Signature Header:", signatureHeader);

    // 🔐 Parse the signature format: t=timestamp,te=signature,li=
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

        // Create the signed payload: timestamp.body
        const signedPayload = `${timestamp}.${body}`;

        const computedSignature = crypto
          .createHmac("sha256", webhookSecret)
          .update(signedPayload)
          .digest("hex");

        console.log(
          "🧮 Computed signature:",
          computedSignature.substring(0, 30) + "...",
        );
        console.log(
          "📊 Expected signature:",
          signature.substring(0, 30) + "...",
        );
        console.log("✅ Signatures match?", computedSignature === signature);

        if (computedSignature !== signature) {
          console.log("❌ Invalid webhook signature");
          return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 },
          );
        }

        console.log("✅ Signature verified successfully!");
      }
    }

    const event = JSON.parse(body);

    console.log("📩 Webhook Event Type:", event.data.attributes.type);

    if (event.data.attributes.type === "link.payment.paid") {
      const paymentData = event.data.attributes.data;
      const attributes = paymentData.attributes;

      const payment = attributes.payments?.[0]?.data?.attributes;

      console.log("🎉 Payment Successful!");
      console.log("📌 Reference Number:", attributes.reference_number);
      console.log("💰 Amount:", attributes.amount / 100);
       console.log("💳 Method:", payment?.source?.type ?? "N/A");
      console.log(
        "⏰ Paid at:",
        payment?.paid_at
          ? new Date(payment.paid_at * 1000).toISOString()
          : "N/A"
  );
       console.log("📧 Email:", payment?.billing?.email ?? "N/A");

      // 📝 TODO: Update your database here
      // await db.orders.update({
      //   where: { reference_number: attributes.reference_number },
      //   data: {
      //     status: 'paid',
      //     paid_at: new Date(),
      //     amount: attributes.amount / 100
      //   }
      // });

      return NextResponse.json({
        received: true,
        message: "Payment processed successfully",
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Webhook Error:", error);
    console.error("Stack:", error.stack);
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
