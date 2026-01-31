import CartDrawer from "@/components/CartDrawer";
import Header from "@/components/customer/homepage/Header";
import { CartProvider } from "@/contexts/CartContext";
import { OrderProvider } from "@/contexts/OrderContext";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrderProvider>
        <CartProvider>
          <Header />
          <CartDrawer />
          {children}
        </CartProvider>
      </OrderProvider>
    </>
  );
}
