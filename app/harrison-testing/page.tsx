import Hero from "@/components/Hero";
import Features from "@/components/Feature";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/harrisonProducts";
import { Flame, Utensils, Check } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const featured = products.slice(0, 3);

  return (
    <>
      <Hero />
      
      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-[#111111] mb-6">Our Story</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Founded on the belief that good food brings people together, Harrison serves 
                the most authentic Mang Inasal flavors in the city. We are a family-owned 
                business dedicated to preserving the traditional charcoal-grilling method 
                that defines Filipino cuisine.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C8A951]/20 flex items-center justify-center text-[#5C3A21]"><Check className="w-4 h-4" /></div>
                  <span className="font-medium text-[#111111]">100% Fresh Ingredients</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C8A951]/20 flex items-center justify-center text-[#5C3A21]"><Check className="w-4 h-4" /></div>
                  <span className="font-medium text-[#111111]">Family Recipe Marinade</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-square bg-gray-200 rounded-md overflow-hidden border border-[#5C3A21]/10">
                <img src="https://images.unsplash.com/photo-1544025162-d76690b6d012?auto=format&fit=crop&q=80&w=800" alt="Grilling" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Features />

      {/* Featured Dishes */}
      <section id="menu" className="py-24 bg-[#F8F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#111111] mb-4">Featured Dishes</h2>
            <p className="text-gray-600">Taste our most popular items, grilled to perfection.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/order" className="inline-block border-b-2 border-[#5C3A21] text-[#111111] font-bold pb-1 hover:text-[#5C3A21] transition-colors">
              View Full Menu &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-[#111111] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <Flame className="w-10 h-10 mx-auto text-[#C8A951]" />
              <h3 className="text-xl font-bold">Traditional Grilling</h3>
              <p className="text-gray-400 text-sm">We use real charcoal for that distinct smoky aroma you love.</p>
            </div>
            <div className="space-y-4">
              <Utensils className="w-10 h-10 mx-auto text-[#C8A951]" />
              <h3 className="text-xl font-bold">Quality Ingredients</h3>
              <p className="text-gray-400 text-sm">Sourced daily from trusted local farmers and suppliers.</p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 mx-auto text-[#C8A951] font-bold text-2xl flex items-center justify-center border-2 border-[#C8A951] rounded-full">₱</div>
              <h3 className="text-xl font-bold">Affordable Prices</h3>
              <p className="text-gray-400 text-sm">Delicious meals that don't break the bank.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#5C3A21]/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-[#111111] mb-8">Ready to Experience Real Inasal?</h2>
          <Link href="/order" className="inline-flex items-center justify-center px-10 py-5 bg-[#111111] text-white font-bold rounded-md hover:bg-[#5C3A21] transition-colors duration-300 shadow-lg shadow-[#111111]/20">
            Start Ordering
          </Link>
        </div>
      </section>
    </>
  );
}