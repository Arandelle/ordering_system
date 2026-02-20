import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Orders";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: "Running" });
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const MINIMUM_AMOUNT = 100;
    const TAX_RATE = 0.12;

    const body = await request.json();
    const { items, subTotal } = body;

    if (!items?.length || !subTotal) {
      return NextResponse.json(
        {
          error: "Form should be completed!",
        },
        {
          status: 400,
        },
      );
    }

    // Enforce minimum (can't be bypassed)
    if (subTotal < MINIMUM_AMOUNT) {
      return NextResponse.json(
        { error: `Minimum order amount is ₱${MINIMUM_AMOUNT}` },
        { status: 400 },
      );
    }

    const tax = subTotal * TAX_RATE;
    const total = subTotal + tax;

    const secretKey = process.env.SK_TEST_KEY_PAYMONGO;

    if (!secretKey) {
      return NextResponse.json(
        {
          error: "PayMongo secret key not configured",
        },
        {
          status: 500,
        },
      );
    }

    // --- 1. Create PayMongo Link ---
    const description = `Order - ${items.map((i: any) => i.name).join(", ")}`;

    const response = await fetch("https://api.paymongo.com/v1/links", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(secretKey + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(total * 100), // convert to cents
            description,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }

    const { id, attributes } = data.data;

    // --- 2. Create Order in DB ---
    const order = await Order.create({
      status: "pending",
      items,
      paymentInfo: {
        paymentLinkId: id,
        checkoutUrl: attributes.checkout_url,
        referenceNumber: attributes.reference_number,
      },
      total: {
        subTotal,
        total,
      },
      timeline: {}, // empty, filled as order progresses
    });

    return NextResponse.json({
      id: attributes.id,
      checkout_url: attributes.checkout_url,
      amount: attributes.amount,
      description: attributes.description,
      status_from_paymongo: attributes.status,
      reference_number: attributes.reference_number,
      live_mode: attributes.livemode,
      paymentLinkId: data.data.id,

      orderId: order._id,
      checkoutUrl: attributes.checkout_url,
      referenceNumber: attributes.reference_number,
      status: order.status,
      

    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
