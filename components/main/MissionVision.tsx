import React from "react";

export default function MissionVision() {
  return (
    <div className="min-h-screen bg-linear-to-br from-stone-50 via-amber-50/30 to-stone-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-328 mx-auto space-y-24">
        {/* Mission Section */}
        <section className=" overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 p-8 lg:p-16 items-center">
            {/* Left: Overlapping Images */}
            <div className="relative h-112.5 lg:h-125 order-2 lg:order-1">
              {/* Large Image */}
              <div className="absolute left-0 top-0 w-[85%] h-full rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="/images/mission-chefs-img.jpg"
                  alt="Chefs grilling the inasal"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Small Overlapping Image */}
              <div className="absolute right-0 bottom-8 w-[48%] h-55 rounded-xl overflow-hidden p-2 bg-linear-to-br from-stone-100 to-amber-100/50  transform hover:scale-105 transition-transform duration-500 z-10">
                <img
                  src="/images/mission-product-img.jpg"
                  alt="Harrion Inasal product"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Right: Mission Text */}
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-5xl lg:text-6xl font-bold text-stone-900 leading-tight">
                Our Mission
              </h2>

              <div className="space-y-4 text-stone-600 leading-relaxed">
                <p className="text-lg">
                  To serve authentic Filipino inasal and barbecue crafted with
                  care, quality ingredients, and time-honored techniques that
                  highlight the true taste of local flavors.
                </p>

                <p className="text-lg">
                  We aim to create a warm and welcoming dining experience where
                  families, friends, and communities can come together over
                  great food.
                </p>

                <p className="text-lg">
                  Guided by integrity and passion for Filipino cuisine, we
                  continuously improve our processes and offerings to ensure
                  quality, affordability, and trust in every plate we serve.
                </p>
              </div>

              {/* Mission Points with Checkmarks */}
              <ul className="space-y-3 mt-8">
                {[
                  "Authenticity in Every Recipe",
                  "Quality You Can Taste",
                  "Warm and Honest Customer Service",
                  "Serving and Supporting Local Communities",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 group">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-[#e13e00] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-stone-700 font-medium text-base lg:text-lg">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 p-8 lg:p-16 items-center">
            {/* Left: Vision Text */}
            <div className="space-y-6">
              <h2 className="text-5xl lg:text-6xl font-bold text-stone-900 leading-tight">
                Our Vision
              </h2>

              <div className="space-y-4 text-stone-600 leading-relaxed">
                <p className="text-lg">
                  To become a beloved Filipino food brand recognized for
                  authentic inasal, flavorful barbecue, and consistent quality
                  across every location.
                </p>

                <p className="text-lg">
                  We aspire to grow through responsible franchising, empowering
                  entrepreneurs while maintaining strong standards in food
                  preparation, service, and brand identity.
                </p>
              </div>

              {/* Vision Highlights Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                {[
                  {
                    title: "Authenticity",
                    description:
                      "Honoring traditional Filipino inasal and barbecue through time-tested recipes and techniques",
                  },
                  {
                    title: "Quality",
                    description:
                      "Delivering consistently flavorful food made with care, fresh ingredients, and attention to detail",
                  },
                  {
                    title: "Integrity",
                    description:
                      "Serving our customers with honesty, fairness, and respect in every interaction",
                  },
                  {
                    title: "Community",
                    description:
                      "Bringing people together through food and supporting the communities we serve",
                  },
                ].map((highlight, index) => (
                  <div
                    key={index}
                    className="bg-linear-to-br from-stone-100 to-amber-100/50 p-5 border-l-4 border-[#e13e00] hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <h3 className="text-stone-900 font-bold text-lg mb-2">
                      {highlight.title}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {highlight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Overlapping Images */}
            <div className="relative h-112.5 lg:h-125">
              {/* Large Image */}
              <div className="absolute left-0 top-0 w-[85%] h-full rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="/images/vision-building.jpg"
                  alt="Store Building"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Small Overlapping Image */}
              <div className="absolute right-0 bottom-1/2 translate-y-1/2 w-[48%] h-55 rounded-xl overflow-hidden p-2 bg-linear-to-br from-stone-100 to-amber-100/50 transform hover:scale-105 transition-transform duration-500 z-10">
                <img
                  src="/images/vision-store.jpg"
                  alt="Store with staffs"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
