"use client";
import React, { useState } from "react";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSubdomainPath } from "@/hooks/useSubdomainUrl";

const Header = () => {
  useScrollToSection();
  const orderUrl = useSubdomainPath("/", "food");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { label: "About", section: "about" },
    { label: "Products", section: "products-main" },
    { label: "Franchise", section: "franchise" },
    { label: "Locations", section: "locations" },
    { label: "Contact", section: "contact" },
  ];

  return (
    <nav className="sticky top-0 bg-white z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-4">
        <div className="flex items-center justify-between h-10 md:h-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="cursor-pointer w-12 h-12 bg-[#e13e00] rounded-full flex items-center justify-center"
            >
              <Image
                src="/images/harrison_logo.png"
                alt="..."
                width={500}
                height={500}
                priority // or add error handling
                onError={(e) => {
                  console.log("Image failed to load");
                  e.currentTarget.src = "images/harrison_logo.png.jpg"; // Optional fallback
                }}
              />
            </Link>
            <div className="">
              <h1 className="text-[#e13e00] font-bold text-lg leading-tight">
                Harrison
              </h1>
              <p className={`text-slate text-sm`}>House of Inasal & BBQ</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.section}
                href={`/?section=${item.section}`}
                className="text-gray-800 font-[550] hover:text-[#e13e00] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={orderUrl}
              className="block w-full bg-[#e13e00] text-white px-6 py-2 font-bold text-center hover:bg-[#b83200] transition-colors"
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
              className="block w-full bg-[#e13e00] text-white px-6 py-3 font-bold text-center hover:bg-[#b83200] transition-colors"
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
