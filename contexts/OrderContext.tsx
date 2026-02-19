"use client";

import { OrderType } from "@/types/OrderTypes";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface OrderContextType {
  placedOrders: OrderType[];
  isLoading: boolean;
  error: string | null;
  addOrder: (order: OrderType) => void;
  updateOrderStatus: (orderId: string, status: OrderType["status"]) => void;
  markAsReviewed: (orderId: string) => void;
  activeOrdersCount: number;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [placedOrders, setPlacedOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try{
      setIsLoading(true);
      setError(null);

      const response = await fetch('api/orders');

      if(!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();

      setPlacedOrders(data);

    }catch(error: any){
      setError(error.message ?? "Something went wrong")
    } finally{
      setIsLoading(false);
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = (orderId: string, status: OrderType["status"]) => {
    if (!orderId) return;

    setPlacedOrders((prev) =>
      prev.map((order) =>
        order._id === orderId ? { ...order, status } : order,
      ),
    );
  };

  const markAsReviewed = (orderId: string) => {
    if (!orderId) return;

    setPlacedOrders((prev) =>
      prev.map((order) =>
        order._id === orderId
          ? {
              ...order,
              isReviewed: true,
              reviewedAt: new Date().toISOString(),
            }
          : order,
      ),
    );
  };

  const activeOrdersCount = placedOrders.filter(
    (order) =>
      order.status !== "cancelled" &&
      (order.status !== "completed" || !order.isReviewed),
  ).length;

  return (
    <OrderContext.Provider
      value={{
        placedOrders,
        isLoading,
        error,
        addOrder: (order) => setPlacedOrders((prev) => [...prev, order]),
        updateOrderStatus,
        markAsReviewed,
        activeOrdersCount,
        clearOrder: () => setPlacedOrders([]),
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
};
