import { CheckIcon } from "lucide-react";
import About from "./About";

// ─── What We Bring data ──────────────────────────────────────────────────────
const tablePillars = [
  {
    number: "01",
    audience: "For Diners",
    headline: "Comfort food with character.",
    body: "We serve everyday grilled favorites that feel like they came from your own family's ihawan — only better timed, better marinated, and always with care.",
    accent: "#ef4501",
  },
  {
    number: "02",
    audience: "For Families & Communities",
    headline: "Warmth and welcome, for every generation.",
    body: "From grandparents to grandkids, Harrison is everyone's favorite — with kid-friendly meals, comfort classics, and a place that feels like home. Perfect for reunions, kwentuhan, and everyday bonding.",
    accent: "#c73d00",
  },
  {
    number: "03",
    audience: "For Franchise Partners",
    headline: "Character-first, story-strong, brand-ready.",
    body: "With a clear identity, loyal following, and scalable story, Harrison offers a differentiated position in the inasal/BBQ space with emotional staying power.",
    accent: "#a83200",
  },
];


export default function MissionVision() {
  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-28">

          {/* ── MISSION ────────────────────────────────────────────────────── */}
        <section className="overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 p-8 items-center">
            {/* Images */}
            <div className="relative h-96 lg:h-125 order-2 lg:order-1">
              <div className="absolute left-0 top-0 w-[85%] h-full overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="/images/mission-chefs-img.jpg"
                  alt="Chefs grilling the inasal"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute right-0 bottom-8 w-[48%] h-52 overflow-hidden p-1 bg-gray-50 transform hover:scale-105 transition-transform duration-500 z-10 shadow-xl">
                <img
                  src="/images/mission-product-img.jpg"
                  alt="Harrison Inasal product"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2 space-y-6">
              <p className="text-brand-color-500 font-bold tracking-[0.2em] uppercase text-sm">
                Our Mission
              </p>
              <h2 className="text-5xl lg:text-6xl font-black text-stone-900 leading-tight">
                Grilled with purpose.
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed">
                To serve proudly Filipino grilled food that brings people
                together — always marinated with care, grilled to perfection,
                and served with a smile as warm as Harrison himself.
              </p>
              <ul className="space-y-3 mt-8">
                {[
                  "Authenticity in Every Recipe",
                  "Quality You Can Taste",
                  "Warm and Honest Customer Service",
                  "Serving and Supporting Local Communities",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 group">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-brand-color-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <CheckIcon size={14} className="text-white"/>
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

        {/* ── VISION ─────────────────────────────────────────────────────── */}
        <section className="overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 p-8 items-center">
            {/* Text */}
            <div className="space-y-6">
              <p className="text-brand-color-500 font-bold tracking-[0.2em] uppercase text-sm">
                Our Vision
              </p>
              <h2 className="text-5xl lg:text-6xl font-black text-brand-brown-800 leading-tight">
                Everyone's
                <br />
                favorite table.
              </h2>
              <p className="text-lg text-brand-brown-600 leading-relaxed">
                To become the Philippines' most loved inasal and BBQ
                destination, known for its homey flavor, genuine hospitality,
                and the everyday joy that comes with being welcomed to
                Harrison's table.
              </p>

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
                ].map((h, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 p-5 border-l-4 border-brand-color-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <h3 className="text-stone-900 font-bold text-lg mb-2">
                      {h.title}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {h.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="relative h-96 lg:h-125">
              <div className="absolute left-0 top-0 w-[85%] h-full overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="/images/vision-building.jpg"
                  alt="Store Building"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute right-0 bottom-1/2 translate-y-1/2 w-[48%] h-52 overflow-hidden p-1 bg-gray-50 transform hover:scale-105 transition-transform duration-500 z-10 shadow-xl">
                <img
                  src="/images/vision-store.jpg"
                  alt="Store with staffs"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/** About the company */}

        <About />

        {/* ── WHAT WE BRING TO THE TABLE ─────────────────────────────────── */}
        <section className="space-y-12">
          {/* Header with image */}
          <div className="relative overflow-hidden rounded-3xl h-64 lg:h-72">
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
                className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="p-8 space-y-4">
                  <p
                    className="text-5xl font-black text-brand-brown-100"
                  >
                    {p.number}
                  </p>
                  <div>
                    <p
                      className="text-xs font-bold tracking-widest uppercase mb-1 text-brand-color-500"
                    >
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
