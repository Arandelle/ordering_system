"use client";

import { formatCurrency } from "@/helper/formatCurrency";
import { useProducts } from "@/hooks/api/useProducts";
import { useSubdomainPath } from "@/hooks/useSubdomainUrl";
import Link from "next/link";


const MenuSection = () => {
  const { data: menuProducts, isLoading } = useProducts({
    limit: 10,
    sort: "price:desc",
  });
  const menuUrl = useSubdomainPath("/", "food");

  return (
    <section id="menu" className="bg-white">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
          {/* Content Section */}
          <div className="order-2 lg:order-1 w-full space-y-10">
            <div className="max-w-3xl space-y-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-color-500">
                From the grill
              </p>
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-950 leading-tight">
                  Guests' Favourites
                </h2>
                <div className="h-1 w-16 rounded-full bg-brand-color-500" />
                <p className="max-w-2xl text-base md:text-lg leading-8 text-slate-500">
                  A quick look at the grilled picks customers come back for.
                  Fresh, smoky, and ready for sharing.
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-[2rem_0.75rem_2.5rem_0.75rem] border border-slate-100 bg-slate-50/70 p-5 sm:p-6">
              <div className="grid gap-x-10 gap-y-5 text-slate-900 md:grid-cols-2">
              {isLoading
                ? Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 border-b border-dashed border-slate-200 pb-3"
                    >
                      <span className="h-3 w-28 rounded-xl bg-slate-200 animate-pulse" />
                      <div className="flex-1 border-b border-dotted border-slate-200 mx-2 animate-pulse" />
                      <span className="h-3 w-12 rounded-xl bg-slate-200 animate-pulse" />
                    </div>
                  ))
                : menuProducts?.data.map((item) => (
                    <div
                      key={item._id}
                      className="group flex items-start gap-4 border-b border-dashed border-slate-200 pb-4 last:border-b-0 md:last:border-b md:nth-last-[-n+2]:border-b-0"
                    >
                      <span className="min-w-0 flex-1 text-base font-thin leading-6 text-slate-900 transition-colors group-hover:text-brand-color-500">
                        <span className="line-clamp-2">{item.name}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-color-500 shadow-sm ring-1 ring-slate-100">
                        {formatCurrency(item.price as number)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <Link
              href={menuUrl}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-brand-color-500 px-8 py-3.5 text-base font-thin text-white shadow-sm shadow-brand-color-500/20 transition-colors hover:bg-brand-color-600"
            >
              Explore Our Menu
            </Link>
          </div>

          {/* Image Section */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-4/5 overflow-hidden rounded-[4.5rem_1.5rem_5.75rem_2.25rem] border-4 border-brand-color-500/10 bg-brand-color-50 shadow-2xl shadow-slate-900/10">
              <img
                src="/images/harrison_homecoming.png"
                alt="Harrison's Grilled Filipino Favorites"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="absolute -bottom-5 left-6 rounded-[1.5rem_0.75rem_1.75rem_0.75rem] bg-white px-5 py-3 shadow-xl ring-1 ring-slate-100">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-color-500">
                Freshly grilled
              </p>
              <p className="text-sm font-semibold text-slate-600">
                Served hot from the house.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
