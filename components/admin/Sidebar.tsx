import { getLucideIcon } from "@/lib/iconUtils";
import { LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
  { name: "Orders", path: "/orders", icon: "ShoppingCart" },
  { name: "Products", path: "/products", icon: "Package" },
  { name: "Customers", path: "/accounts", icon: "Users" },
  { name: "Reports", path: "/reports", icon: "ChartLine" },
  { name: "Settings", path: "/settings", icon: "Settings" },
];

const Sidebar = ({ isMobileOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      {/** Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 w-64 ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/** Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold text-[#e13e00] leading-tight">
              Harrison
            </h1>
            <p className="text-xs font-semibold text-slate-900">
              Mang Inasal and BBQ
            </p>
          </div>

          {/** Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="py-6 px-3 overflow-y-auto h-[calc(100vh-80px)]">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = getLucideIcon(item.icon);
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duratin-200 group ${isActive ? "bg-[#e13e00]/80 text-white" : "text-gray-600 hover:bg-slate-100 hover:text-[#e13e00]"}`}
                  >
                    <Icon size={18} />
                    <span className="font-semibold text-sm">{item.name}</span>
                    {isActive && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-white" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/** Logout */}
          <div className="mt-6 pt-6 border-t border-stone-200">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 font-semibold text-sm cursor-pointer">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
