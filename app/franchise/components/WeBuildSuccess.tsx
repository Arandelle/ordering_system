"use client";

import { getLucideIcon } from "@/lib/iconUtils";
import React from "react";

const WeBuildSuccessTogether = () => {
  const supportFeatures = [
    {
      icon: "BookOpen",
      title: "Operations Manual",
      description: "Complete business system & operations manual.",
    },
    {
      icon: "Settings",
      title: "Turnkey System",
      description: "Hands-on training program.",
    },
    {
      icon: "GraduationCap",
      title: "Training Program",
      description: "Site selection & store setup guidance.",
    },
    {
      icon: "MapPin",
      title: "Site & Setup Support",
      description: "Marketing materials and campaigns.",
    },
    {
      icon: "Megaphone",
      title: "Marketing Support",
      description: "Ongoing operational support.",
    },
    {
      icon: "LifeBuoy",
      title: "Ongoing Assistance",
      description: "Exclusive territory opportunities.",
    },
  ];

  const journeySteps = [
    {
      number: "1",
      title: "Inquiry",
      description: "Submit your interest form.",
    },
    {
      number: "2",
      title: "Dicovery Call",
      description: "Learn more about Harrison.",
    },
    {
      number: "3",
      title: "Evaluation",
      description: "See if we're the right fit.",
    },
    {
      number: "4",
      title: "Approval",
      description: "Secure your franchise",
    },
    {
      number: "5",
      title: "Training & Setup",
      description: "Prepare for lunch",
    },
    {
      number: "6",
      title: "Grand Opening!",
      description: "Start your opening",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/** What you get */}
          <div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              What you get
            </h2>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-12">
              When you join Harrison, you gain access to:
            </p>

            {/* Support Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {supportFeatures.map((feature, index) => {
                const Icon = getLucideIcon(feature.icon);

                return (
                  <div
                    key={index}
                    className="bg-brand-white border border-gray-100 rounded-xl p-6 hover:bg-gray-50 transition-colors duration-300"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <Icon className="w-6 h-6 text-brand-color-500 shrink-0 mt-1" />
                      <h3 className="text-lg font-bold text-slate-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full max-w-7xl mx-auto py-12">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              Ideal Franchise Partner:
            </h2>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-12">
              We’re looking for individuals who are:
            </p>

            <div>
              <ul className="flex flex-wrap justify-center gap-4">
                {[
                  "Entrepreneurial and driven",
                  "Passionate about business growth",
                  "Committed to following proven systems",
                  "Customer-focused and results-oriented",
                ].map((item, index) => {
                  const Icon = getLucideIcon("CheckCircle");

                  return (
                    <li
                      key={index}
                      className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:shadow-md transition"
                    >
                      <Icon className="w-4 h-4 text-brand-color-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/*  Journey Timeline */}
          <div className="w-full max-w-7xl mx-auto py-12">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              How it works
            </h2>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-12">
              Franchise Process
            </p>

            {/* Desktop: Horizontal timeline */}
            <div className="hidden sm:flex items-start justify-between relative py-12">
              <div className="flex justify-between w-full relative z-10">
                {journeySteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                  >
                    {/* Timeline marker */}
                    <div className="w-12 h-12 rounded-full bg-brand-color-500 text-white font-bold flex items-center justify-center text-lg border border-brand-color-500 shadow-md relative z-10">
                      {step.number}
                    </div>
                    {/* Connection line - only shows between steps 1-6 */}
                    <div className="absolute top-5 left-12 right-12 h-0.5 bg-brand-color-500 z-0"></div>
                    {/* Content below marker */}
                    <div className="mt-8 text-center max-w-xs">
                      <h3 className="text-base font-bold text-brand-color-500 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: Vertical timeline */}
            <div className="sm:hidden space-y-8">
              {journeySteps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  {/* Left side: timeline marker and connector */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-brand-color-500 text-white font-bold flex items-center justify-center text-base border border-brand-color-500 shadow-md relative z-10">
                      {step.number}
                    </div>
                    {/* Connector line only between steps (not after last step) */}
                    {index !== journeySteps.length - 1 && (
                      <div className="w-0.5 h-16 bg-brand-color-500 mt-2"></div>
                    )}
                  </div>

                  {/* Right side: content */}
                  <div className="pt-1">
                    <h3 className="text-base font-bold text-brand-color-600 dark:text-brand-color-400 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="my-16">
            <div className="flex flex-col items-center gap-6 mb-12">
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-center text-slate-900">
                WHY INVEST IN FRANCHISING
              </h1>
              <div className="w-20 h-1 bg-orange-500 rounded-full" />
            </div>

            <p className="max-w-3xl mx-auto text-center text-lg sm:text-xl text-gray-600 leading-relaxed">
              Franchising allows you to operate your own business with the
              backing of an established system, reducing risks compared to
              starting from scratch. It combines independence with structured
              support — giving you the best of both worlds.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Footer Section */}
      <div className="bg-black text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6">
            Ready to Own a Harrison Franchise?
          </h2>

          <p className="text-lg sm:text-xl text-gray-300 mb-12 leading-relaxed">
            Take the first step toward building your business today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 sm:px-10 py-3 sm:py-4 bg-brand-color-500 hover:bg-brand-color-600 text-white font-bold rounded-full transition-all duration-300 transform hover:-translate-y-1">
              Apply Now
            </button>
            <button className="px-8 sm:px-10 py-3 sm:py-4 border-2 border-brand-color-500 text-brand-color-500 hover:bg-brand-color-500/10 font-bold rounded-full transition-all duration-300">
              Download Franchise Kit
            </button>
            <button className="px-8 sm:px-10 py-3 sm:py-4 border-2 border-brand-color-500 text-brand-color-500 hover:bg-brand-color-500/10 font-bold rounded-full transition-all duration-300">
              Talk to our Team
            </button>
          </div>
        </div>
      </div>

      {/* Footer Contact */}
      <div className="bg-slate-900 text-gray-400 py-6 px-4 sm:px-6 lg:px-8 text-center text-sm">
        <p>
          Harrison’s House of Inasal & BBQ Grilled right. Shared with heart.
        </p>
        <p>Contact Us: franchise@harrisonsbbq.com | +63 (87) XXX XXX</p>
      </div>
    </div>
  );
};

export default WeBuildSuccessTogether;
