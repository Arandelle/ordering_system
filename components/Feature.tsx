import { Flame, Clock, Utensils } from "lucide-react";

const features = [
  {
    icon: Flame,
    title: "Charcoal Grilled",
    desc: "Authentic smoky flavor from real charcoal fire."
  },
  {
    icon: Clock,
    title: "Fast Service",
    desc: "Hot meals ready in minutes, not hours."
  },
  {
    icon: Utensils,
    title: "Quality Meals",
    desc: "Fresh ingredients sourced daily from local markets."
  }
];

export default function Features() {
  return (
    <section className="py-20 bg-white border-y border-[#5C3A21]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-[#F8F7F4] rounded-md text-[#5C3A21]">
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#111111]">{feature.title}</h3>
              <p className="text-gray-600 max-w-xs">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}