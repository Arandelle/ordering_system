// app/api/paymongo/link-status/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const linkId = req.nextUrl.searchParams.get("linkId");

  if (!linkId) {
    return NextResponse.json(
      { error: "Missing linkId" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://api.paymongo.com/v1/links/${linkId}`,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.SK_TEST_KEY_PAYMONGO + ":"
            ).toString("base64"),
        },
      }
    );

    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: json },
        { status: res.status }
      );
    }

    return NextResponse.json({
      status: json.data.attributes.status, // unpaid | paid | expired
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
