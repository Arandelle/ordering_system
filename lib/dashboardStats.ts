import { Order } from "@/models/Orders";
import { connectDB } from "./mongodb";

export async function getDashboardStats() {
  await connectDB();

  const totalOrders = await Order.countDocuments();

  const revenueResult = await Order.aggregate([
    {$match: {
        status: {
            $nin: ["pending", "cancelled"]
        }
    }},
    { $group: { _id: null, totalRevenue: { $sum: "$total.total" } } },
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  const pendingOrders = await Order.countDocuments({ status: "pending" });

  const bestSellerResult = await Order.aggregate([
    { $match: { status: { $nin: ["pending", "cancelled"] } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" } } },
    { $sort: { totalSold: -1 } },
    { $limit: 1 },
  ]);

  return {
    totalOrders,
    totalRevenue,
    pendingOrders,
    bestSellingProduct: bestSellerResult[0]?._id || "NA",
    bestSellingCount: bestSellerResult[0]?.totalSold || 0,
  };
}
