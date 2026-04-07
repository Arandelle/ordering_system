import { getDashboardStats } from "@/helper/dashboardStats";
import { requireAdmin } from "@/lib/getAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const stats = await getDashboardStats();
    await requireAdmin(req);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard stats",
      },
      { status: 500 },
    );
  }
}
