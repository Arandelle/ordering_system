'use client'

import StatusBadge from "@/components/ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderType } from "@/types/OrderTypes";
import { OrderActionButton } from "./OrderActionButton";
import PermissionGuard from "@/lib/PermissionGuard";
import LoadingPage from "@/components/ui/LoadingPage";
import { formatDate } from "@/helper/formatDate";
import { useRouter } from "next/navigation";

export default function OrdersTable({
  orders,
  isPending,
}: {
  orders: OrderType[];
  isPending: boolean;
}) {

  const router = useRouter();

  const headerTitles = [
    "Customer",
    "Items",
    "Total",
    "Reference",
    "Payment Method",
    "Status",
    "Time",
    "Actions",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="p-6 border-b border-stone-200">
        <h3 className="text-lg font-bold text-stone-800">Recent Orders</h3>
        <p className="text-sm text-stone-500 mt-1">Latest customer orders</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headerTitles.map((head, index) => (
                <TableHead
                  key={index}
                  className="px-4 py-4 uppercase text-xs font-semibold tracking-wider text-center"
                >
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-stone-100 relative">
            {orders.length > 0 ? (
              orders.map((order) => {
                const isMaya = order.paymentInfo.paymentMethod === "maya";

                return (
                  <TableRow
                    key={order._id}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-gray-900">
                          {order.paymentInfo.firstName ?? "—"}{" "}
                          {order.paymentInfo.lastName ?? "—"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.paymentInfo.customerEmail ?? "—"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.paymentInfo.customerPhone ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-sm text-stone-600">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-sm font-semibold text-stone-800">
                        ₱{order.total.totalAmount?.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-xs font-medium text-stone-600 uppercase">
                        {order.paymentInfo.referenceNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          isMaya
                            ? "bg-green-100 text-green-700"
                            : "text-orange-700 bg-orange-100"
                        }`}
                      >
                        {isMaya ? "Maya" : "Cash on Delivery"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-xs text-stone-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col lg:flex-row gap-2 items-center justify-center">
                        <button
                          onClick={() => router.push(`/orders/${order._id}`)}
                          className="text-xs font-bold bg-blue-700 hover:bg-blue-800 py-2 px-3 text-white rounded-full cursor-pointer text-nowrap"
                        >
                          View Details
                        </button>

                        <PermissionGuard permission="orders.update">
                          <OrderActionButton
                            orderId={order._id}
                            status={order.status}
                            paymentMethod={order.paymentInfo.paymentMethod}
                            role="admin"
                          />
                        </PermissionGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : isPending ? (
              <TableRow>
                <TableCell>
                  <div className="h-full bg-white">
                    <LoadingPage />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <p className="text-sm text-gray-500">
                    No orders found on this branch.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
