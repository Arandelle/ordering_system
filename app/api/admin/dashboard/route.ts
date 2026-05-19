import { getSalesData, getTopProducts, DashboardRange } from "@/services/admin/dashboard.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const range = (req.nextUrl.searchParams.get("range") ?? "week") as DashboardRange;

  const [salesData, topProducts] = await Promise.all([
    getSalesData(range),
    getTopProducts(range),
  ]);

  return NextResponse.json({ salesData, topProducts });
}