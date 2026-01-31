"use client";
import React from "react";
import { useSubdomainPath } from "@/hooks/useSubDomainUrl";

const HeroVideo = () => {
  // Navigate to food subdomain
  const orderUrl = useSubdomainPath("/", "food");
  const menuUrl = useSubdomainPath("/menu", "food");

  // Or if you want to go back to main domain from food subdomain:
  // const homeUrl = useSubdomainPath('/', undefined) // goes to domain.com

  return (
    <section className="relative w-full">
      <div className="max-w-8xl mx-auto">
        <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden shadow-2xl">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/videos/hero-ads.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Dark Overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/40" />

          {/* Content Overlay - Left Aligned */}
          <div className="relative z-10 flex items-center h-full px-6 sm:px-10 lg:px-16">
            <div className="">
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                HARRISON HOUSE OF
                <span className="block text-[#e13e00] mt-2">INASAL & BBQ</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-xl">
                Experience authentic Filipino BBQ and Inasal. Grilled to
                perfection, served with love.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={orderUrl}
                  className="w-full sm:w-auto bg-[#e13e00] text-white px-8 py-4 text-lg font-bold hover:bg-[#b83200] transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Order Now
                </a>
                <a
                  href={menuUrl}
                  className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-8 py-4 text-lg font-bold hover:bg-white hover:text-[#e13e00] transition-all duration-300"
                >
                  View Menu
                </a>
              </div>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroVideo;
