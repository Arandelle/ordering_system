import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/ui/Footer";
import Header from "@/components/customer/homepage/Header";
import { CartProvider } from "@/contexts/CartContext";
import { OrderProvider } from "@/contexts/OrderContext";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartProvider>
        <Header />
        <CartDrawer />
        {children}
        <Footer />
      </CartProvider>
    </>
  );
}
