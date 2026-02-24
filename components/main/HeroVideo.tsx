"use client";
import React from "react";
import { useSubdomainPath } from "@/hooks/useSubdomainUrl";
import { ArrowBigDown, ArrowDown, ChevronDown } from "lucide-react";

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
                <span className="block text-brand-color-500 mt-2">INASAL & BBQ</span>
              </h1>

              {/* Subheading */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-12 bg-linear-to-r from-transparent to-brand-color-500"></div>
                <span className="text-brand-color-500 font-bold tracking-wider uppercase text-sm">
                  Every Bite Tells a Story
                </span>
                <div className="h-px w-12 bg-linear-to-r from-brand-color-500 to-transparent"></div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={orderUrl}
                  className="w-full sm:w-auto bg-brand-color-500 text-white px-8 py-4 text-lg font-bold hover:bg-brand-color-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Order Now
                </a>
                <a
                  href={menuUrl}
                  className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-8 py-4 text-lg font-bold hover:bg-white hover:text-dark-green transition-all duration-300"
                >
                  View Menu
                </a>
              </div>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="flex flex-col items-center justify-center gap-2 absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white">
             <p className="text-sm">Scroll down</p>
            <ChevronDown size={30}/>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroVideo;
