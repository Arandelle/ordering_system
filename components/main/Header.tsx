"use client";
import React, { useState } from "react";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSubdomainPath } from "@/hooks/useSubdomainUrl";
import HeaderLogo from "../HeaderLogo";

const Header = () => {
  useScrollToSection();
  const orderUrl = useSubdomainPath("/", "food");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { label: "Products", section: "products-main" },
    { label: "About", section: "about" },
    { label: "News", section: "news" },
    { label: "Franchise", section: "franchise" },
    { label: "Locations", section: "locations" },
    { label: "Contact", section: "contact" },
  ];

  function useScrollLink(section: string) {
    const pathname = usePathname();

    return (e: React.MouseEvent) => {
      if (pathname === "/") {
        e.preventDefault();
        document
          .getElementById(`${section}-section`)
          ?.scrollIntoView({ behavior: "smooth" });
      }
    };
  }

  return (
    <nav className="sticky top-0 bg-white z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-4">
        <div className="flex items-center justify-between h-10 md:h-12">
          {/* Logo */}
          <HeaderLogo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.section}
                href={`/?section=${item.section}`}
                onClick={useScrollLink(item.section)}
                className="text-gray-800 font-[550] hover:text-brand-color-500 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={orderUrl}
              className="block w-full bg-brand-color-500 text-white px-6 py-2 font-bold text-center hover:bg-brand-color-600 transition-colors"
            >
              Order Now
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-800 p-2 cursor-pointer"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.section}
                href={`/?section=${item.section}`}
                className="block w-full text-left text-gray-800 font-[550] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={orderUrl}
              className="block w-full bg-brand-color-500 text-white px-6 py-3 font-bold text-center hover:bg-brand-color-600 transition-colors"
            >
              Order Now
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
