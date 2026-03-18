"use client";

import { useIntersectionAnimation } from "@/hooks/utils/useIntersectionAnimation";

const About = () => {
  const { ref } = useIntersectionAnimation();

  return (
    <section
      id="about-section"
      ref={ref}
      className="relative py-20 lg:py-32 overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Section */}
          <div className="relative group order-2 lg:order-1">
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <img
                src="/images/aboutimage.png"
                alt="Harrison's Grilled Filipino Favorites"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Main Quote */}
            <blockquote className="space-y-4">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-serif italic font-semibold text-brand-color-500 leading-relaxed">
                "A place for grilled Filipino favorites, shared moments, and
                everyday connection."
              </p>
              <div className="w-12 h-1 bg-brand-color-500 rounded-full" />
            </blockquote>

            {/* Description */}
            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-gray-700 max-w-2xl lg:max-w-md text-justify">
                Inspired by the rich tradition of Filipino grilling, Harrison's
                brings together great-tasting food, generous servings, and warm
                hospitality.
              </p>

              <p className="text-base leading-relaxed text-gray-600 max-w-2xl lg:max-w-md text-justify">
                We believe that good food creates great memories—that's why
                every dish is prepared fresh, marinated well, and grilled to
                perfection. Just like the most loved grill brands in the
                Philippines, we focus on delivering consistent quality,
                flavorful meals, and an enjoyable dining experience for
                everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
