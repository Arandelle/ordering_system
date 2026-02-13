import React from 'react';
import { Order } from '@/types/adminType';
import StatusBadge from './StatusBadge';

interface OrdersTableProps {
  orders: Order[];
  showActions?: boolean;
}

export default function OrdersTable({ orders, showActions = true }: OrdersTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="p-6 border-b border-stone-200">
        <h3 className="text-lg font-bold text-stone-800">Recent Orders</h3>
        <p className="text-sm text-stone-500 mt-1">Latest customer orders</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Time
              </th>
              {showActions && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-stone-800">{order.id}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-stone-700">{order.customerName}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-stone-600">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-stone-800">
                    ₱{order.totalPrice.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-stone-600 uppercase">
                    {order.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-stone-500">
                    {formatDate(order.createdAt)}
                  </span>
                </td>
                {showActions && (
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                        View
                      </button>
                      <button className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        Update
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}