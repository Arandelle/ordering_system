"use client";

import { LINKS } from "@/constant/links";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { getLucideIcon } from "@/lib/iconUtils";

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

  // Subject options for contact form
  const subjectOptions = [
    { value: "", label: "Select a subject" },
    { value: "General Inquiry", label: "General Inquiry" },
    { value: "Feedback", label: "Feedback" },
    { value: "Catering Request", label: "Catering Request" },
    { value: "Partnership", label: "Partnership" },
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
              
              const Icon = getLucideIcon(item.icon)

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

      {/* Locations Section */}
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
                  <MapPin className="w-5 h-5 text-[#e13e00] shrink-0 mt-1" />
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

      {/* Contact Form Section */}
      <section id="contact-section" className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              CONTACT US
            </h2>
            <p className="text-lg text-gray-600">
              Have questions, feedback, or inquiries? Send us a message and
              we'll get back to you.
            </p>
          </div>

          <form className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                Name <span className="text-[#e13e00]">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`w-full px-4 py-3 border bg-white text-gray-900 focus:outline-none focus:border-[#e13e00] ${"border-gray-300"}`}
                placeholder="Your full name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                Email <span className="text-[#e13e00]">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full px-4 py-3 border bg-white text-gray-900 focus:outline-none focus:border-[#e13e00] ${"border-gray-300"}`}
                placeholder="your.email@example.com"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`w-full px-4 py-3 border bg-white text-gray-900 focus:outline-none focus:border-[#e13e00] ${"border-gray-300"}`}
                placeholder="+63 912 345 6789"
              />
            </div>

            {/* Subject Field */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                Subject <span className="text-[#e13e00]">*</span>
              </label>
              <select
                id="subject"
                name="subject"
                className={`w-full px-4 py-3 border bg-white text-gray-900 focus:outline-none focus:border-[#e13e00] ${"border-gray-300"}`}
              >
                {subjectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Field */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                Message <span className="text-[#e13e00]">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className={`w-full px-4 py-3 border bg-white text-gray-900 focus:outline-none focus:border-[#e13e00] resize-none ${"border-gray-300"}`}
                placeholder="How can we help you?"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-[#e13e00] text-white py-4 font-bold text-lg hover:bg-[#b83200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </section>

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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold text-[#e13e00] mb-4">
                HARRISON MANG INASAL BBQ
              </h3>
              <p className="text-gray-400 text-sm">
                Serving authentic Filipino charcoal-grilled BBQ since day one.
                Quality, tradition, and flavor in every bite.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Us</h4>
              <div className="space-y-3">
                <a
                  href="tel:+639123456789"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>+63 912 345 6789</span>
                </a>
                <a
                  href="mailto:info@harrisonmanginasal.com"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>info@harrisonmanginasal.com</span>
                </a>
                <a
                  href="mailto:franchise@harrisonmanginasal.com"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>franchise@harrisonmanginasal.com</span>
                </a>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-lg font-bold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a
                  href="https://facebook.com/harrisonmanginasal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 flex items-center justify-center hover:bg-[#e13e00] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com/harrisonmanginasal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 flex items-center justify-center hover:bg-[#e13e00] transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com/harrisonmanginasal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 flex items-center justify-center hover:bg-[#e13e00] transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Harrison Mang Inasal BBQ. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default About;
