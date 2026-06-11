import { Metadata } from "next";
import React from "react";
import { syne } from "../font";
import { StaffProvider } from "@/contexts/StaffContext";
import { AdminBranchProvider } from "@/contexts/AdminBranchContext";

export const metadata: Metadata = {
  title: "Admin | Harrison House of Inasal & BBQ",
  icons: {
    icon: "/images/harrison_logo.png",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminBranchProvider>
      <StaffProvider>
        <div className={`${syne.className}`}>{children}</div>
      </StaffProvider>
    </AdminBranchProvider>
  );
}
