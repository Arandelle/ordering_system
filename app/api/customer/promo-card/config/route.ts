import { connectDB } from "@/lib/mongodb";
import { getPromoCardConfig } from "@/lib/promoCardConfig";
import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rateLimit";

async function _GET() {
  try {
    await connectDB();

    const config = await getPromoCardConfig();

    return NextResponse.json({
      enabled: config.enabled,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch promo card config",
      },
      {
        status: 500,
      },
    );
  }
}

export const GET = withRateLimit(_GET, "api");
