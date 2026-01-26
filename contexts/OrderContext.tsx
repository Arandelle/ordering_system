"use client";

import { OrderType } from "@/types/OrderTypes";
import { createContext, useContext, useEffect, useState } from "react";

interface OrderContextType {
  placedOrders: OrderType[];
  addOrder: (order: OrderType) => void;
  updateOrderStatus: (orderId: string, status: OrderType['status']) => void;
  totalOrders: number;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [placedOrders, setPlacedOrders] = useState<OrderType[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load order on mount
  useEffect(() => {
    const storedOrder = localStorage.getItem("orders");
    if (storedOrder) {
      try {
        const parsed = JSON.parse(storedOrder);

        if (Array.isArray(parsed)) {
          setPlacedOrders(parsed);
        } else {
          setPlacedOrders([]);
        }
      } catch (e) {
        console.error("Failed to parsed stored order", e);
        setPlacedOrders([]);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save order when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("orders", JSON.stringify(placedOrders));
    }
  }, [placedOrders, isHydrated]);

  const updateOrderStatus = (orderId: string, status: OrderType["status"]) => {
    if (!orderId) return;

    setPlacedOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
  };

  const totalOrders = placedOrders.filter((item) => (item.status !== 'cancelled' && item.status !== 'completed')).length

  return (
    <OrderContext.Provider
      value={{
        placedOrders,
        addOrder: (order) => setPlacedOrders((prev) => [...prev, order]),
        updateOrderStatus,
        totalOrders,
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
  return ctx; // sample usage -> {placedOrders, addOrder, clearOrders} = useOrder();
};
