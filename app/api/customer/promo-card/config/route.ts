import { connectDB } from "@/lib/mongodb";
import { getPromoCardConfig } from "@/lib/promoCardConfig";
import { NextResponse } from "next/server";

export async function GET() {
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
