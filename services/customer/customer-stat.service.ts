import { Order } from "@/models/Orders";
import { ORDER_STATUSES } from "@/types/orderConstants";

export async function getCustomerStats(emails: string[]) {
  const stats = await Order.aggregate([
    { $match: { "paymentInfo.customerEmail": { $in: emails }, status: ORDER_STATUSES.COMPLETED }},
    {
      $group: {
        _id: "$paymentInfo.customerEmail",
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$total.totalAmount" },
      },
    },
  ]);

  // Convert to a map for O(1) lookup
  return Object.fromEntries(
    stats.map((s) => [
      s._id,
      { totalOrders: s.totalOrders, totalSpent: s.totalSpent },
    ]),
  );
}
