import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: "Running" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description } = body;

    if (!amount || !description) {
      return NextResponse.json(
        {
          error: "Amount and description is required!",
        },
        {
          status: 400,
        },
      );
    }

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
            amount: Number(amount * 100), // in cents
            description,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json({
        checkout_url: data.data.attributes.checkout_url,
        amount: data.data.attributes.amount,
        description: data.data.attributes.description,
        status: data.data.attributes.status,
        reference_number: data.data.attributes.reference_number,
        live_mode: data.data.attributes.livemode
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
