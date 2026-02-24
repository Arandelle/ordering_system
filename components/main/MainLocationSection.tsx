import { LINKS } from "@/constant/links";
import { getLucideIcon } from "@/lib/iconUtils";
import { MapPin } from "lucide-react";
import React from "react";

const MainLocationSection = () => {
  // Locations data
  const locations = [
    {
      id: 1,
      name: "Harrison Main Branch",
      address: "G/F Kalayaan Ave, Makati City, Metro Manila",
      mapUrl: LINKS.MAIN_BRANCH_LINK,
    },
    {
      id: 2,
      name: `King's Court`,
      address: `5/F King's Court Building 2, 2129 Chino Roces Avenue, Brgy Pio del Pilar, Makati City, Metro Manila`,
      mapUrl: LINKS.KINGS_COURT_LINK,
    },
  ];

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
      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#ef4501]/90">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Craving Authentic Mang Inasal BBQ?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Order now and experience the bold, smoky flavors of our
            charcoal-grilled Filipino favorites.
          </p>
          <button className="w-48 h-14 bg-white text-[#ef4501] font-bold text-lg hover:bg-gray-100 transition-colors">
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
                  <div className="w-12 h-12 bg-[#ef4501] text-white flex items-center justify-center font-bold text-xl mb-4">
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
                className="text-[#ef4501] font-medium hover:underline"
              >
                franchise@harrisonmanginasal.com
              </a>
            </p>
            <a
              href="mailto:franchise@harrisonmanginasal.com?subject=Franchise%20Application"
              className="inline-block bg-[#ef4501] text-white px-8 py-4 font-bold text-lg hover:bg-[#b83200] transition-colors"
            >
              Apply for Franchise
            </a>
          </div>
        </div>
      </section>
      <section id="locations-section" className="py-20 px-4 bg-gray-50 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              OUR LOCATIONS
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find a Harrison Mang Inasal BBQ branch near you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-white p-6 border border-gray-200"
              >
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-[#ef4501] shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {location.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{location.address}</p>
                  </div>
                </div>
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gray-100 text-gray-800 py-2 font-medium text-center hover:bg-gray-200 transition-colors"
                >
                  View on Map
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default MainLocationSection;
