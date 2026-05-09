"use client";

import Link from "next/link";

const UnavailablePage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Radial Background */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#174674]/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[#C99B49]/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-[350px] w-[350px] rounded-full bg-[#174674]/10 blur-3xl" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-black/10 bg-white/70 px-4 py-1 text-xs tracking-[0.3em] uppercase text-gray-500 shadow-sm backdrop-blur">
          Under Construction
        </div>

        <h1 className="max-w-4xl text-5xl font-extralight tracking-tight text-gray-900 md:text-7xl">
          Something new is
          <span className="block font-light text-[#174674]">
            coming soon.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-sm leading-relaxed text-gray-500 md:text-base">
          This page is currently being developed and refined to provide a
          better experience. Please check back again soon.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-[#174674] px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-[#12385d]"
          >
            Back Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnavailablePage;