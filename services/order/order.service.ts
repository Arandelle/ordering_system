import { Order } from "@/models/Orders";
import {
  FULFILLMENT_TYPE,
  ORDER_ACTION_CONFIG,
  OrderStatus,
  STATUS_PRIORITY,
} from "@/types/orderConstants";
import { buildPaginationMeta } from "../../utils/query-helpers";
import { PAYMENT_STATUSES } from "@/types/paymentConstants";

export type OrderQueryOptions = {
  filter: Record<string, any>;
  page?: number;
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
};

/** Count orders matching a filter — used for tab count badges */
export async function countOrders(filter: Record<string, any>): Promise<number> {
  return Order.countDocuments(filter);
}

export async function queryOrders(options: OrderQueryOptions) {
  const { filter, page = 1, limit = 20, skip = 0 } = options;

  // Map STATUS_PRIORITY into a MongoDB $switch expression
  const priorityBranches = Object.entries(STATUS_PRIORITY).map(
    ([status, priority]) => ({
      case: { $eq: ["$status", status] },
      then: priority,
    }),
  );

  const [result] = await Order.aggregate([
    { $match: filter },
    {
      // Add a numeric priority field for sorting
      $addFields: {
        statusPriority: {
          $switch: {
            branches: priorityBranches,
            default: 99,
          },
        },

        reviewPriority: {
          $cond: [
            { $eq: ["$status", "completed"] },
            { $cond: ["$isReviewed", 1, 0] },
            0,
          ],
        },
      },
    },
    { $sort: { statusPriority: 1, reviewPriority: 1, createdAt: -1 } }, // sort BEFORE pagination
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ]);

  const orders = result.data;
  const total = result.total[0]?.count ?? 0;

  const formatter = (order: any) => ({
    _id: order._id,
    customerId: order.customerId,
    createdAt: order.createdAt,
    branchSnapshot: order.branchSnapshot,
    status: order.status,
    fulfillmentType: order.fulfillmentType ?? FULFILLMENT_TYPE.DELIVERY,
    items: order.items,
    total: order.total,
    paymentInfo: {
      ...order.paymentInfo,
      // Computed: true only when both paymentStatus and paymentId confirm a real transaction
      paymentConfirmed:
        order.paymentInfo?.paymentStatus === PAYMENT_STATUSES.PAYMENT_SUCCESS &&
        !!order.paymentInfo?.paymentId,
    },
    estimatedTime: order.estimatedTime,
    isReviewed: order.isReviewed,
    actionConfig: ORDER_ACTION_CONFIG[order.status as OrderStatus],
    priority: STATUS_PRIORITY[order.status as OrderStatus],
  });

  return {
    data: orders.map(formatter),
    pagination: buildPaginationMeta(total, page, limit),
  };
}
