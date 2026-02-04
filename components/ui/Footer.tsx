"use client";

import { useSubdomainPath } from "@/hooks/useSubdomainUrl";
import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import React from "react";

const Footer = ({
  variant = "customer",
}: {
  variant?: "marketing" | "customer";
}) => {

  const currentYear = new Date().getFullYear();
  const homeUrl = useSubdomainPath("/", "");
  const menuUrl = useSubdomainPath("/menu", "food");
  const bestSellerUrl = useSubdomainPath("/?section=bestsellers", "food");
  const ourStoryUrl = useSubdomainPath("/?section=story", "food");

  const footerQuickLinks = {
    customer: [
      { name: "Home", href: homeUrl },
      { name: "Menu", href: menuUrl },
      { name: "Best Sellers", href: bestSellerUrl },
      { name: "Our Story", href: ourStoryUrl},
    ],

    marketing: [
      { name: "Menu", href: menuUrl },
      { name: "News", href: "?section=news" },
      { name: "Franchise", href: "?section=franchise" },
    ],
  };

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Refund Policy", href: "#" },
    { name: "FAQ", href: "#" },
  ];

  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/** Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/** Brand Columns */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#e13e00] rounded-full flex items-center justify-center">
                <img src="images/harrison_logo.png" alt="harrison_logo" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Harrison</h3>
                <p className="text-gray-400 text-xs">House of Inasal & BBQ</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Every bite, has story. Authentic Filipino grilling experience that
              brings families and friends together.
            </p>

            {/** Social Links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-[#e13e00] rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href=""
                className="w-10 h-10 bg-white/10 hover:bg-[#e13e00] rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href=""
                className="w-10 h-10 bg-white/10 hover:bg-[#e13e00] rounded-full flex items-center justify-center transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/** Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {footerQuickLinks[variant].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#e13e00] transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/** Legal */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#e13e00] transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/** Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#e13e00] shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Makati, Metro Manila, Philippines
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#e13e00] shrink-0" />
                <a
                  href="tel:+639123456789"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  +63 912 345 6789
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#e13e00] shrink-0" />
                <a
                  href="mailto:hello@harrison.ph"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  hello@harrison.ph
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={18} className="text-[#e13e00] shrink-0" />
                <span className="text-gray-400 text-sm">
                  Daily: 10:00 AM - 10:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h4 className="font-semibold text-lg mb-1">
                Subscribe to our Newsletter
              </h4>
              <p className="text-gray-400 text-sm">
                Get exclusive deals and updates straight to your inbox!
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for subscribing!");
              }}
              className="flex w-full max-w-md gap-3"
            >
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#e13e00] transition-colors"
              />
              <button
                type="submit"
                className="bg-[#e13e00] hover:bg-[#c13500] text-white px-6 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-gray-400 text-sm">
              © {currentYear} Harrison – House of Inasal & BBQ. All rights
              reserved.
            </p>
            <p className="text-gray-500 text-xs">
              Made with 🔥 in the Philippines
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
