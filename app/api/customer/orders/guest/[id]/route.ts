import { queryOrders } from "@/services/order/order.service";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rateLimit";

// app/api/orders/guest/[id]/route.ts
async function _GET(
  request: NextRequest,
  context: {params: Promise<{id: string}>},
) {
const { id } = await context.params;
  const order = await queryOrders({
    filter: { _id: id },
    limit: 1,
  });

  const found = order.data[0];
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Block if belongs to registered customer
  if (found.customerId) {
    return NextResponse.json(
      { error: "Sign in to view this order.", code: "AUTH_REQUIRED" },
      { status: 403 },
    );
  }

  return NextResponse.json({ data: found });
}

export const GET = withRateLimit(_GET, "public");
