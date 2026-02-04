"use client";

import { useScrollToSection } from "@/hooks/useScrollToSection";
import { getLucideIcon } from "@/lib/iconUtils";
import MissionVision from "./MissionVision";

const About = () => {
  useScrollToSection();
  // Franchise steps
  const franchiseSteps = [
    {
      icon: "Send",
      title: "Inquiry",
      description:
        "Submit your franchise application and express your interest in joining the Harrison Mang Inasal family.",
    },
    {
      icon: "NotebookPen",
      title: "Evaluation",
      description:
        "Our team reviews your application, conducts interviews, and assesses location viability.",
    },
    {
      icon: "BicepsFlexed",
      title: "Setup & Training",
      description:
        "Complete comprehensive training on operations, food preparation, and customer service.",
    },
    {
      icon: "Rocket",
      title: "Opening",
      description:
        "Launch your branch with full support from our team and start serving authentic Filipino BBQ.",
    },
  ];

  return (
    <>
      <section id="about-section" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                ABOUT HARRISON MANG INASAL BBQ
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Harrison Mang Inasal BBQ has been serving authentic Filipino
                  charcoal-grilled dishes since its founding. Our commitment to
                  quality and tradition has made us a trusted name in Filipino
                  BBQ cuisine.
                </p>
                <p>
                  Every piece of chicken inasal, liempo, and pork BBQ is
                  marinated in our signature blend of spices and grilled over
                  real charcoal to achieve that distinctive smoky flavor that
                  Filipinos love.
                </p>
                <p>
                  We source only the freshest ingredients and maintain strict
                  quality standards across all our branches. Our recipes have
                  been perfected over years of serving satisfied customers who
                  keep coming back for more.
                </p>
                <p>
                  From our humble beginnings to multiple branches nationwide,
                  Harrison Mang Inasal BBQ continues to bring the authentic
                  taste of Filipino BBQ to communities across the Philippines.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white p-6 border border-gray-200">
                <div className="w-12 h-12 bg-[#e13e00] flex items-center justify-center mb-4">
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
                <div className="w-12 h-12 bg-[#e13e00] flex items-center justify-center mb-4">
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
                <div className="w-12 h-12 bg-[#e13e00] flex items-center justify-center mb-4">
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
      <MissionVision />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#e13e00]/90">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Craving Authentic Mang Inasal BBQ?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Order now and experience the bold, smoky flavors of our
            charcoal-grilled Filipino favorites.
          </p>
          <button className="w-48 h-14 bg-white text-[#e13e00] font-bold text-lg hover:bg-gray-100 transition-colors">
            Order Now
          </button>
        </div>
      </section>

      {/* Franchise Section */}
      <section id="franchise-section" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              HOW TO FRANCHISE
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join the Harrison Mang Inasal BBQ family and bring authentic
              Filipino BBQ to your community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {franchiseSteps.map((item) => {
              const Icon = getLucideIcon(item.icon);

              return (
                <div
                  key={item.title}
                  className="bg-gray-50 p-6 border border-gray-200"
                >
                  <div className="w-12 h-12 bg-[#e13e00] text-white flex items-center justify-center font-bold text-xl mb-4">
                    <Icon />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Ready to start your franchise journey? Contact us at{" "}
              <a
                href="mailto:franchise@harrisonmanginasal.com"
                className="text-[#e13e00] font-medium hover:underline"
              >
                franchise@harrisonmanginasal.com
              </a>
            </p>
            <a
              href="mailto:franchise@harrisonmanginasal.com?subject=Franchise%20Application"
              className="inline-block bg-[#e13e00] text-white px-8 py-4 font-bold text-lg hover:bg-[#b83200] transition-colors"
            >
              Apply for Franchise
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
