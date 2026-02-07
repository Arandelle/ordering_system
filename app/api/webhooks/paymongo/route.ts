// app/api/webhooks/paymongo/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("paymongo-signature");

    // 🔒 Verify the webhook is actually from PayMongo
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const computedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (computedSignature !== signature) {
        console.log("❌ Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    
    console.log("📩 Webhook Event Type:", event.data.attributes.type);

    // ✅ Handle successful payment
    if (event.data.attributes.type === "link.payment.paid") {
      const paymentData = event.data.attributes.data;
      const attributes = paymentData.attributes;
      
      console.log("🎉 Payment Successful!");
      console.log("Reference Number:", attributes.reference_number);
      console.log("Amount:", attributes.amount / 100);
      console.log("Payment Method:", attributes.source?.type);
      console.log("Paid At:", attributes.paid_at);

      // 📝 TODO: Update your database here
      // Example:
      // await db.orders.update({
      //   where: { reference_number: attributes.reference_number },
      //   data: { status: 'paid', paid_at: attributes.paid_at }
      // });

      return NextResponse.json({ 
        received: true,
        message: "Payment processed successfully" 
      });
    }

    // Handle other events if needed
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ 
      error: error.message 
    }, { 
      status: 500 
    });
  }
}