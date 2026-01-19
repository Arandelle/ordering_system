import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  openGraph: {
    title: "Home | Harrison House of Inasal & BBQ",
    description:
      "Discover Harrison: proudly Filipino BBQ and Inasal, served with stories and barkada vibes. New branches, online orders, and collabs coming soon—follow the grill!",
    type: "website",
    url: "https://harrisonhouseofinasal.com/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
