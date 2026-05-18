import { CartProvider } from "@/contexts/CartContext";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer | House of Inasal & BBQ",
  manifest: "/manifest.json",
};

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartProvider>{children}</CartProvider>
    </>
  );
}
