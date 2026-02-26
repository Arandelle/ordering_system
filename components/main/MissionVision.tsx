"use client";

import { CheckIcon } from "lucide-react";
import About from "./About";
import {
  useIntersectionAnimation,
  useIntersectionAnimationList,
} from "@/hooks/useIntersectionAnimation";
import { animationStyle } from "@/helper/animationStyle";

// ── What We Bring data ───────────────────────────────────────────────────────
const tablePillars = [
  {
    number: "01",
    audience: "For Diners",
    headline: "Comfort food with character.",
    body: "We serve everyday grilled favorites that feel like they came from your own family's ihawan — only better timed, better marinated, and always with care.",
  },
  {
    number: "02",
    audience: "For Families & Communities",
    headline: "Warmth and welcome, for every generation.",
    body: "From grandparents to grandkids, Harrison is everyone's favorite — with kid-friendly meals, comfort classics, and a place that feels like home. Perfect for reunions, kwentuhan, and everyday bonding.",
  },
  {
    number: "03",
    audience: "For Franchise Partners",
    headline: "Character-first, story-strong, brand-ready.",
    body: "With a clear identity, loyal following, and scalable story, Harrison offers a differentiated position in the inasal/BBQ space with emotional staying power.",
  },
];

const missionItems = [
  "Authenticity in Every Recipe",
  "Quality You Can Taste",
  "Warm and Honest Customer Service",
  "Serving and Supporting Local Communities",
];

const visionCards = [
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
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function MissionVision() {
  // Mission section
  const { ref: missionImgRef, isVisible: isMissionImgVisible } =
    useIntersectionAnimation();
  const { ref: missionTextRef, isVisible: isMissionTextVisible } =
    useIntersectionAnimation();

  // Vision section
  const { ref: visionImgRef, isVisible: isVisionImgVisible } =
    useIntersectionAnimation();
  const { ref: visionTextRef, isVisible: isVisionTextVisible } =
    useIntersectionAnimation();

  // Mission checklist items
  const { itemRefs: missionItemRefs, visibleItems: visibleMissionItems } =
    useIntersectionAnimationList<HTMLLIElement | HTMLDivElement>(missionItems.length);

  // Vision cards
  const { itemRefs: visionCardRefs, visibleItems: visibleVisionCards } =
    useIntersectionAnimationList<HTMLDivElement>(visionCards.length);

  // "What We Bring" section
  const { ref: bringHeaderRef, isVisible: isBringHeaderVisible } =
    useIntersectionAnimation();
  const { itemRefs: pillarRefs, visibleItems: visiblePillars } =
    useIntersectionAnimationList<HTMLDivElement>(tablePillars.length);

  const fade = animationStyle; // alias for brevity

  return (
    <div className="bg-white px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-28">

<section className="pt-16 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">

    {/* ── LEFT COLUMN: Mission ── */}
    <div className="flex flex-col pb-12 lg:pb-0 lg:pr-8 xl:pr-12">

      {/* Label pill */}
      <span className="inline-flex items-center gap-2 text-xl font-semibold tracking-[0.2em] uppercase text-brand-color-500 mb-6">
        <span className="w-6 h-px bg-brand-color-500 inline-block" />
        Our Mission
      </span>

      {/* Mission text block with image as background */}
      <div
        ref={missionTextRef}
        className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8"
      >
        {/* Background image */}
        <img
          src="https://cdn.apartmenttherapy.info/image/upload/v1747078194/tk/photo/2025/05-2025/2025-05-filipino-chicken-inasal/filipino-chicken-inasal-581.jpg"
          alt="Grilled Filipino chicken inasal with atchara, rice, and spiced vinegar dip on banana leaf"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Text content on top */}
        <div className={`relative z-10 p-8 ${animationStyle(isMissionTextVisible).className}`}>
          <p className="text-white leading-relaxed text-lg">
            To serve proudly Filipino grilled food that brings people together —
            always marinated with care, grilled to perfection, and served with a
            smile as warm as Harrison himself.
          </p>
        </div>
      </div>

      {/* Mission items */}
      <div className="mt-8 space-y-3">
        {missionItems.map((item, index) => (
          <div
            ref={(el) => { missionItemRefs.current[index] = el; }}
            key={index}
            className={`group flex items-start gap-3 ${animationStyle(visibleMissionItems[index]).className}`}
            style={animationStyle(visibleMissionItems[index]).style}
          >
            <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-brand-color-500 group-hover:scale-125 transition-transform duration-200" />
            <p className="text-stone-700 text-lg leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>

    {/* ── RIGHT COLUMN: Vision ── */}
    <div className="flex flex-col pt-12 lg:pt-0 lg:pl-8 xl:pl-12">

      {/* Label pill */}
      <span className="inline-flex items-center gap-2 text-xl font-semibold tracking-[0.2em] uppercase text-brand-color-500 mb-6">
        <span className="w-6 h-px bg-brand-color-500 inline-block" />
        Our Vision
      </span>

      {/* Vision text block with image as background */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 mb-10">
        {/* Background image */}
        <img
          src="https://panlasangpinoy.com/wp-content/uploads/2010/04/Pinoy-Pork-Barbeque.jpg"
          alt="Classic Filipino pork barbecue skewers grilled to perfection with dipping sauce and sides"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Text content on top */}
        <div className="relative z-10 p-8">
          <p className="text-white leading-relaxed text-lg">
            To become the Philippines' most loved inasal and BBQ destination, known
            for its homey flavor, genuine hospitality, and the everyday joy that
            comes with being welcomed to Harrison's table.
          </p>
        </div>
      </div>

      {/* Vision cards with large ghost number accent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visionCards.map((item, index) => (
          <div
            key={index}
            className="
              relative overflow-hidden
              bg-gray-50 hover:bg-brand-color-500/5
              border border-gray-100 hover:border-brand-color-500/30
              rounded-2xl p-5
              transition-all duration-300 group
            "
          >
            {/* Ghost number background texture */}
            <span className="absolute -top-3 -right-1 text-7xl font-black text-gray-100 group-hover:text-brand-color-500/10 transition-colors duration-300 leading-none select-none pointer-events-none">
              {String(index + 1).padStart(2, "0")}
            </span>

            <h3 className="relative text-gray-900 font-bold text-base mb-1.5 group-hover:text-brand-color-500 transition-colors duration-200">
              {item.title}
            </h3>
            <p className="relative text-gray-500 text-sm leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>

  </div>
</section>

        {/* About the company */}
        <About />

        {/* ── WHAT WE BRING TO THE TABLE ───────────────────────────────────── */}
        <section className="space-y-12">
          {/* Header with image */}
          <div
            ref={bringHeaderRef}
            className={`relative overflow-hidden rounded-3xl h-64 lg:h-72 ${fade(isBringHeaderVisible).className}`}
            style={fade(isBringHeaderVisible).style}
          >
            <img
              src="/images/grilled.jpg"
              alt="Harrison's table spread"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-stone-900/80 via-stone-900/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10 lg:px-16 space-y-2">
              <p className="text-brand-color-500 font-bold tracking-[0.2em] uppercase text-sm">
                For Everyone
              </p>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                What We Bring
                <br />
                to the Table
              </h2>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid lg:grid-cols-3 gap-6">
            {tablePillars.map((p, i) => (
              <div
                key={i}
                ref={(el) => {
                  pillarRefs.current[i] = el;
                }}
                className={`group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${fade(visiblePillars[i], i * 120).className}`}
                style={fade(visiblePillars[i], i * 120).style}
              >
                <div className="p-8 space-y-4">
                  <p className="text-5xl font-black text-brand-brown-100">
                    {p.number}
                  </p>
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase mb-1 text-brand-color-500">
                      {p.audience}
                    </p>
                    <h3 className="text-brand-brown-800 font-black text-xl leading-tight">
                      {p.headline}
                    </h3>
                  </div>
                  <p className="text-brand-brown-600 text-base leading-relaxed">
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
