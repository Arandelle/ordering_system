"use client";

import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

export const HeaderNavLinks = () => {
  const { data } = useQuery({
    queryKey: ["customer", "promo-card", "config"],
    queryFn: () =>
      apiClient.get<{ enabled: boolean }>("/customer/promo-card/config"),
    staleTime: 60_000,
  });

  return (
    <div className="gap-6 hidden lg:flex">
      {data?.enabled && (
        <Link href="/promo-card" className="hover:text-brand-color-500">
          Promo Card
        </Link>
      )}
  {/** hidden for the meantime until further notice */}
      <Link href="/catering" className="hover:text-brand-color-500 hidden">
        Catering
      </Link>
      <Link href="/contact" className="hover:text-brand-color-500">
        Contact Us
      </Link>
    </div>
  );
};
