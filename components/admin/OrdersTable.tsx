import React from "react";
import { Order } from "@/types/adminType";
import StatusBadge from "../ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { OrderType } from "@/types/OrderTypes";

interface OrdersTableProps {
  orders: OrderType[];
  showActions?: boolean;
}

export default function OrdersTable({
  orders,
  showActions = true,
}: OrdersTableProps) {

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const headerTitles = [
    "Order ID",
    // "Customer",
    "Items",
    "Total",
    "Reference",
    "Status",
    "Time",
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
                <TableHead key={index} className="px-4 py-4 uppercase text-xs font-semibold tracking-wider text-center">
                  {head}
                </TableHead>
              ))}

              {showActions && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-stone-100">
            {orders.map((order) => (
              <TableRow
                key={order._id}
                className="hover:bg-stone-50 transition-colors"
              >
                <TableCell>
                  <span className="text-sm font-semibold text-stone-800">
                    {order._id}
                  </span>
                </TableCell>
                {/* <TableCell className="px-6 py-4">
                 
                    {order.customerName}
                  
                </TableCell> */}
                <TableCell className="px-6 py-4">
                  <span className="text-sm text-stone-600">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-sm font-semibold text-stone-800">
                    ₱{order.total.total.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-xs font-medium text-stone-600 uppercase">
                    {order.paymentInfo.referenceNumber}
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
                {showActions && (
                  <TableCell className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                        View
                      </button>
                      <button className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        Update
                      </button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
