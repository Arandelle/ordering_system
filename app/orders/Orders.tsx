"use client";

import { useCart } from "@/contexts/CartContext";
import { useOrder } from "@/contexts/OrderContext";
import { StatusBadge } from "./StatusBadge";
import {
  Banknote,
  Clock,
  Eye,
  MapPin,
  Package,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "To Pay", statuses: ["pending", "paid"] },
  { key: "preparing", label: "To Dispatch" },
  { key: "to-receive", label: "To Receive", statuses: ["dispatched", "ready"] },
  { key: "completed", label: "To Review" },
  { key: "cancelled", label: "Cancelled" },
];

const Orders = () => {
  const { placedOrders, updateOrderStatus } = useOrder();
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") {
      return placedOrders.sort((a, b) => {
        // Pushed cancelled to bottom
        if (a.status === "cancelled" && b.status !== "cancelled") return 1;
        if (a.status !== "cancelled" && b.status === "cancelled") return -1;

        // Sort date by descending
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }

    const currentTab = TABS.find((tab) => tab.key === activeTab);
    return currentTab?.statuses
      ? placedOrders.filter((order) =>
          currentTab.statuses.includes(order.status),
        )
      : placedOrders.filter((order) => order.status === activeTab);
  }, [placedOrders, activeTab]);

  const handleViewDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm(`Are you sure you want to cancel order ${orderId} ? `)) {
      updateOrderStatus(orderId, "cancelled");
    }
  };

  const handleBuyAgain = (orderItems: any[]) => {
    orderItems.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        description: item.description,
        category: item.category,
      });
    });

    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">My Orders</h1>
          <p className="text-slate-600">Track and manage your orders</p>
        </div>
        {/** Navigation Tabs */}
        <div className="overflow-y-visible overflow-x-auto mb-8 pb-2 scrollbar-hide">
          <div className="flex gap-2 py-3">
            {TABS.map((tab) => {
              const count =
                tab.key === "all"
                  ? placedOrders.length
                  : tab.statuses
                    ? placedOrders.filter((o) =>
                        tab.statuses.includes(o.status),
                      ).length
                    : placedOrders.filter((o) => o.status === tab.key).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.key ? "bg-[#e13e00] text-white" : "bg-white text-gray-600 border border-gray-700 hover:border-[#e13e00] hover:text-[#e13e00]"}`}
                >
                  {tab.label}
                  {count > 0 &&
                    !["cancelled", "completed"].includes(tab.key) && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e13e00] text-white text-xs font-bold rounded-full flex items-center justify-center border border-white">
                        {count}
                      </span>
                    )}
                </button>
              );
            })}
            <button 
            onClick={() => router.push("/menu")}
            className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap cursor-pointer bg-[#e13e00] text-white hover:bg-[#c13500]">
             Add new order!
            </button> 
          </div>
        </div>

        {/** Orders */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={40} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No {activeTab !== "all" ? activeTab : ""} orders found.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Your orders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden"
              >
                {/** Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-700 text-lg">
                        Order #{order.id}
                      </p>
                      <div className="flex text-sm text-gray-600 items-center gap-4 py-2">
                        <p className="flex items-center gap-1">
                          <Clock size={16} />
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>

                        <p className="flex items-center gap-1">
                          <Banknote size={16} />
                          {order.paymentInfo.label}
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin size={16} />
                          {order.deliveryInfo.type === "delivery"
                            ? "Delivery"
                            : "Pickup"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                {/** Items */}
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex gap-4">
                        {/** Item Image */}
                        <div className="w-20 h-20 flex shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={24} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/** Item Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Quanity: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-[#e13e00]">
                            ₱{item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/** Order Summary */}
                  <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">SubTotal</span>
                      <span className="font-[550]">
                        ₱{order.totals.subTotal.toFixed(2)}
                      </span>
                    </div>
                    {order.totals.deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium">
                          ₱{order.totals.deliveryFee.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total</span>
                      <span className="text-[#e13e00]">
                        ₱{order.totals.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/** Action Buttons */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex flex-wrap gap-3 justify-end">
                    {/** View Details - Always Available */}
                    <button
                      onClick={() => handleViewDetails(order.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-semibold transition-all"
                    >
                      <Eye size={16} /> View Details
                    </button>

                    {/** Cancel Order - Only for pending orders */}
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-red-300 hover:bg-red-50 text-red-600 text-sm font-semibold transition-all"
                      >
                        <X size={16} /> Cancel Order
                      </button>
                    )}

                    {/** Track Order - For paid and preparing order */}
                    {(order.status === "paid" ||
                      order.status === "preparing") && (
                      <button
                        onClick={() => router.push("/support")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-blue-300 hover:bg-blue-50 text-blue-600 text-sm font-semibold transition-all"
                      >
                        <Package size={16} /> Track Order
                      </button>
                    )}

                    {/* Leave Review & Buy Again - For completed orders */}
                    {(order.status === "completed" && !order.isReviewed) && (
                      <button
                        onClick={() => router.push(`/orders/${order.id}/review`)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e13e00] hover:bg-[#c53600] text-white text-sm font-semibold transition-all shadow-md"
                      >
                        <Star size={16} /> Leave Review
                      </button>
                    )}

                    {(order.status === "completed" ||
                      order.status === "cancelled") && (
                      <button
                        onClick={() => handleBuyAgain(order.items)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#e13e00] hover:bg-orange-50 text-[#e13e00] text-sm font-semibold transition-all"
                      >
                        <ShoppingCart size={16} /> Buy Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
