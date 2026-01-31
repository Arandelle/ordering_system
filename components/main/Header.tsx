"use client";
import React, { useState } from "react";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  useScrollToSection();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 bg-white z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-4">
        <div className="flex items-center justify-between h-16">
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
            <div className="hidden sm:block">
              <h1 className="text-[#e13e00] font-bold text-lg leading-tight">
                Harrison
              </h1>
              <p className={`text-slate text-sm`}>House of Inasal & BBQ</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => router.push("/?scroll=about")}
              className="text-gray-800 font-[550] hover:text-[#e13e00] transition-colors"
            >
              About
            </button>
            <button
              onClick={() => router.push("/?scroll=products")}
              className="text-gray-800 font-[550] hover:text-[#e13e00] transition-colors"
            >
              Products
            </button>
            <button
              onClick={() => router.push("/?scroll=franchise")}
              className="text-gray-800 font-[550] hover:text-[#e13e00] transition-colors"
            >
              Franchise
            </button>
            <button
              onClick={() => router.push("/?scroll=locations")}
              className="text-gray-800 font-[550] hover:text-[#e13e00] transition-colors"
            >
              Locations
            </button>
            <button
              onClick={() => router.push("/?scroll=contact")}
              className="text-gray-800 font-[550] hover:text-[#e13e00] transition-colors"
            >
              Contact
            </button>
            <button
              onClick={() => {
                /* Add your order logic */
              }}
              className="bg-[#e13e00] text-white px-6 py-2 font-bold hover:bg-[#b83200] transition-colors"
            >
              Order Now
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-800 p-2"
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
            <button
              onClick={() => {
                router.push("/?scroll=about");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-800 font-[550] py-2"
            >
              About
            </button>
            <button
              onClick={() => {
                router.push("/?scroll=products");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-800 font-[550] py-2"
            >
              Products
            </button>
            <button
              onClick={() => {
                router.push("/?scroll=franchise");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-800 font-[550] py-2"
            >
              Franchise
            </button>
            <button
              onClick={() => {
                router.push("/?scroll=locations");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-800 font-[550] py-2"
            >
              Locations
            </button>
            <button
              onClick={() => {
                router.push("/?scroll=contact");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-800 font-[550] py-2"
            >
              Contact
            </button>
            <button
              onClick={() => {
                /* Add your order logic */
              }}
              className="block w-full bg-[#e13e00] text-white px-6 py-3 font-bold text-center hover:bg-[#b83200] transition-colors"
            >
              Order Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
