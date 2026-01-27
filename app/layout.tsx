import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/homepage/Header";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { OrderProvider } from "@/contexts/OrderContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home | Harrison House of Inasal & BBQ",
  description:
    "Discover Harrison: proudly Filipino BBQ and Inasal, served with stories and barkada vibes. New branches, online orders, and collabs coming soon—follow the grill!",
};

export default function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OrderProvider>
          <CartProvider>
            <Header />
            <CartDrawer/>
            {children}
            {modal}
          </CartProvider>
        </OrderProvider>
      </body>
    </html>
  );
}
