import { Order } from "@/models/Orders";
import { connectDB } from "../../lib/mongodb";
import { SalesData, TopProduct } from "@/types/adminType";
import { ORDER_STATUSES } from "@/types/orderConstants";
import { Types } from "mongoose";
import { STAFF_ROLES, StaffRole } from "@/types/staff";

export type DashboardRange = "week" | "month" | "year";

export type DashboardFilters = {
  branchId?: string | Types.ObjectId;
};

type DashboardAdminScope = {
  role: StaffRole;
  branch?: string | Types.ObjectId | null;
};

export function resolveDashboardFilters(
  admin: DashboardAdminScope,
  requestedBranchId?: string | null,
): DashboardFilters {
  if (admin.role === STAFF_ROLES.SUPERADMIN) {
    return requestedBranchId && requestedBranchId !== "all"
      ? { branchId: requestedBranchId }
      : {};
  }

  if (!admin.branch) {
    throw new Error("No branch assigned");
  }

  return { branchId: admin.branch };
}

const buildBranchMatch = (filters: DashboardFilters = {}) => {
  if (!filters.branchId) return {};

  const branchId = filters.branchId.toString();

  if (!Types.ObjectId.isValid(branchId)) {
    throw new Error("Invalid branch id");
  }

  return { branchId: new Types.ObjectId(branchId) };
};

export function getDateRange(range: DashboardRange) {
  const now = new Date();
  const start = new Date();

  if (range === "week") {
    start.setDate(now.getDate() - 7);
  }

  if (range === "month") {
    start.setMonth(now.getMonth() - 1);
  }

  if (range === "year") {
    start.setFullYear(now.getFullYear() - 1);
  }

  return { start, end: now };
}

export async function getDashboardStats(filters: DashboardFilters = {}) {
  await connectDB();

  const branchMatch = buildBranchMatch(filters);

  const totalOrders = await Order.countDocuments({
    ...branchMatch,
    status: ORDER_STATUSES.COMPLETED,
  });

  const revenueResult = await Order.aggregate([
    {
      $match: {
        ...branchMatch,
        status: ORDER_STATUSES.COMPLETED,
      },
    },
    { $group: { _id: null, totalRevenue: { $sum: "$total.totalAmount" } } },
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  const pendingOrders = await Order.countDocuments({
    ...branchMatch,
    status: ORDER_STATUSES.PENDING,
  });

  const bestSellerResult = await Order.aggregate([
    { $match: {...branchMatch, status: ORDER_STATUSES.COMPLETED } },
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

export async function getSalesData(
  range: DashboardRange = "week",
  filters: DashboardFilters = {}
): Promise<SalesData[]> {
  await connectDB();

  const { start, end } = getDateRange(range);
  const branchMatch = buildBranchMatch(filters);

  const dateFormat = range === "year" ? "%Y-%m" : "%m/%d";

  const result = await Order.aggregate([
    {
      $match: {
        ...branchMatch,
        createdAt: { $gt: start, $lte: end },
        status: "completed",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: dateFormat, date: "$createdAt" },
        },
        sales: { $sum: "$total.totalAmount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: { _id: 0, date: "$_id", sales: 1 },
    },
  ]);

  return result;
}

export async function getTopProducts(
  range: DashboardRange = "month",
  filters: DashboardFilters = {}
): Promise<TopProduct[]> {
  await connectDB();

  const { start, end } = getDateRange(range);

  const branchMatch = buildBranchMatch(filters);

  const result = await Order.aggregate([
    {
      $match: {
        ...branchMatch,
        createdAt: {
          $gte: start,
          $lte: end,
        },
        status: "completed",
      },
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: "$items.name",
        sales: { $sum: "$items.quantity" },
      },
    },
    { $sort: { sales: -1 } },
    { $limit: 5 },
    { $project: { _id: 0, name: "$_id", sales: 1 } },
  ]);
  return result;
}
