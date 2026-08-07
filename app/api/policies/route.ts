import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withRateLimit } from "@/lib/rateLimit";
import { Policy } from "@/models/Policy";

/**
 * GET /api/policies
 *
 * Public endpoint — returns all policies from the database.
 * No authentication required. Returns an empty array if no
 * policies have been seeded yet.
 */
async function _GET() {
  try {
    await connectDB();

    const policies = await Policy.find({})
      .sort({ slug: 1 })
      .lean();

    return NextResponse.json({ data: policies }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/policies]", error);
    return NextResponse.json(
      { error: "Failed to fetch policies" },
      { status: 500 },
    );
  }
}

export const GET = withRateLimit(_GET, "public");
