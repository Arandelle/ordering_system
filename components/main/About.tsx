"use client";

import { useScrollToSection } from "@/hooks/useScrollToSection";
import { getLucideIcon } from "@/lib/iconUtils";
import MissionVision from "./MissionVision";

const About = () => {
  useScrollToSection();
  return (
    <>
      <section id="about-section" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2
                className="text-3xl md:text-4xl font-bold text-[#ef4501] mb-6"
              >
                Brand Story
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Everyone has that one brother who runs the grill at every
                  gathering — steady hand, serious tongs, always cracking jokes.
                  That’s Harrison.
                </p>
                <p>
                  He’s not the loudest in the family, but he’s the one people
                  gather around. Over the years, his inihaw became legend among
                  friends and neighbors — not because it was fancy, but because
                  it was exactly what you needed, when you needed it.
                </p>
                <p>So when people said,</p>
                <p>
                  “You should open a place, Harrison, ” he finally did. Now,
                  he's grilling for everyone. Still with the same care. Still
                  doing the first flip.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white p-6 border border-gray-200">
                <div className="w-12 h-12 bg-[#ef4501] flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Charcoal-Grilled
                </h3>
                <p className="text-gray-600">
                  We use traditional charcoal grilling methods to achieve that
                  authentic smoky flavor in every dish.
                </p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <div className="w-12 h-12 bg-[#ef4501] flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Filipino Authentic
                </h3>
                <p className="text-gray-600">
                  Our recipes stay true to traditional Filipino flavors, passed
                  down and perfected over generations.
                </p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <div className="w-12 h-12 bg-[#ef4501] flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Quality Guaranteed
                </h3>
                <p className="text-gray-600">
                  We maintain strict quality standards from sourcing to serving,
                  ensuring consistency in every meal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
