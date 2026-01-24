"use client";

import { OrderType } from "@/types/OrderTypes";
import { createContext, useContext, useEffect, useState } from "react";

interface OrderContextType {
  currentOrder: OrderType[];
  setOrder: (order: OrderType[]) => void;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentOrder, setCurrentOrder] = useState<OrderType[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load order on mount
  useEffect(() => {
    const storedOrder = localStorage.getItem("currentOrder");
    if (storedOrder) {
      try {
        setCurrentOrder(JSON.parse(storedOrder));
      } catch (e) {
        console.error("Failed to parsed stored order", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save order when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("currentOrder", JSON.stringify(currentOrder));
    }
  }, [currentOrder, isHydrated]);

  return (
    <OrderContext.Provider
      value={{
        currentOrder,
        setOrder: setCurrentOrder,
        clearOrder: () => setCurrentOrder([]),
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
