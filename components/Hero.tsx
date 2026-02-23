import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative bg-[#F8F7F4] pt-16 pb-24 lg:pt-32 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold text-[#111111] tracking-tight leading-[1.1]">
              Authentic <br/>
              <span className="text-[#5C3A21]">Filipino</span> Grilled <br/>
              Flavors
            </h1>
            <p className="text-lg text-gray-600 max-w-md leading-relaxed">
              Serving quality inasal and BBQ meals crafted with tradition, 
              fresh ingredients, and passion since day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/order" 
                className="inline-flex items-center justify-center px-8 py-4 bg-[#111111] text-white font-medium rounded-md hover:bg-[#5C3A21] transition-colors duration-300"
              >
                Order Now
              </Link>
              <Link 
                href={"/"}
                className="inline-flex items-center justify-center px-8 py-4 bg-white border border-[#5C3A21]/20 text-[#111111] font-medium rounded-md hover:bg-[#5C3A21]/5 transition-colors duration-300"
              >
                View Menu
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-[4/3] bg-gray-200 rounded-md overflow-hidden border border-[#5C3A21]/10">
              <img 
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200" 
                alt="Grilled Chicken Inasal" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#C8A951]/20 -z-10 rounded-md" />
          </div>
        </div>
      </div>
    </section>
  );
}