"use client";

import React, { useState } from "react";
import { useScrollToSection } from "@/hooks/utils/useScrollToSection";
import Link from "next/link";
import { useSubdomainPath } from "@/hooks/useSubdomainUrl";
import BrandLogo from "../BrandLogo";
import { Menu, ShoppingCart, X } from "lucide-react";

const Header = () => {
  useScrollToSection();
  const orderUrl = useSubdomainPath("/", "food");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { label: "Products", section: "/#products-main-section" },
    { label: "About", section: "/#about-section" },
    { label: "Franchise Now", section: "/franchise" },
    { label: "Locations", section: "/#locations-section" },
  ];

  return (
    <nav className="sticky top-0 bg-white z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-4">
        <div className="flex items-center justify-between h-10 md:h-12">
          {/* Logo */}
          <BrandLogo />
 <a
        href="viber://chat?number=%2B639603349533"
        className="flex items-center justify-center gap-2 w-full bg-[#7360F2] hover:bg-[#5d4be0] text-white font-semibold py-3 rounded-xl transition-all shadow hover:shadow-md"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.4 0C5.5.2.8 5 .8 10.9c0 2.4.8 4.6 2 6.4L.8 24l7-2c1.7.9 3.6 1.4 5.6 1.4 5.9 0 10.7-4.8 10.7-10.7S17.3 0 11.4 0zm5.7 15.5c-.3.8-1.5 1.5-2.1 1.6-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-1.9 1-2.2.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.1.1.3 0 .5-.1.2-.2.3-.3.4-.1.1-.3.3-.4.4-.1.1-.2.2-.1.4.5.8 1.1 1.5 1.7 2.1.7.7 1.5 1.2 2.4 1.5.2.1.4.1.5-.1.1-.2.6-.7.8-.9.2-.2.4-.2.6-.1.2.1 1.4.7 1.7.8.2.1.4.2.5.3 0 .2 0 .8-.3 1.6z"/>
        </svg>
        Message us on Viber
      </a>
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.section}
                href={item.section}
                className="text-gray-800 font-[550] hover:text-brand-color-500 transition-colors text-nowrap text-sm"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={orderUrl}
              className="flex items-center justify-center gap-2 w-full bg-brand-color-500 text-white px-4 py-2 text-sm font-bold text-center hover:bg-brand-color-600 transition-colors rounded-full"
            >
              <ShoppingCart size={16} />
              <p>Order Now</p>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-800 p-2 cursor-pointer transition-transform"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
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
                href={item.section}
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
