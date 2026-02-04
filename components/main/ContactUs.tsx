import React from "react";

const ContactUs = () => {
  // Subject options for contact form
  const subjectOptions = [
    { value: "", label: "Select a subject" },
    { value: "General Inquiry", label: "General Inquiry" },
    { value: "Feedback", label: "Feedback" },
    { value: "Catering Request", label: "Catering Request" },
    { value: "Partnership", label: "Partnership" },
  ];
  return (
    <section id="contact-section" className="py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            CONTACT US
          </h2>
          <p className="text-lg text-gray-600">
            Have questions, feedback, or inquiries? Send us a message and we'll
            get back to you.
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
  );
};

export default ContactUs;
