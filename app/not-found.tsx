// app/not-found.tsx
"use client";

import { CircleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-gray-100">
      <Image
        height={250}
        width={250}
        src={"/images/harrison_logo.png"}
        alt="harrison logo"
      />
      <div className="flex items-center gap-4 text-[#e13e00]">
        <CircleAlert size={40} />
        <h3 className="text-2xl font-bold text-center">
          Page not found
        </h3>
      </div>
      <p className="text-center text-slate-500">
        Looks like the page you're looking for doesn't exist.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="mt-4 px-4 py-2 border border-[#e13e00] text-[#e13e00] rounded hover:bg-[#c13500] hover:text-white transition-colors"
        >
          Go to Homepage
        </Link>
        <button
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-[#e13e00] text-white rounded hover:bg-[#c13500] transition-colors cursor-pointer"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
