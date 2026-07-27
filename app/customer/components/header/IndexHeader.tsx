"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useModalQuery } from "@/hooks/utils/useModalQuery";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

import BrandLogo from "@/components/BrandLogo";
import { HeaderNavLinks } from "./HeaderNavLinks";
import { HeaderCartActions } from "./HeaderCartActions";
import { HeaderAuthDesktop } from "./HeaderAuthDesktop";
import { HeaderMobileMenu } from "./HeaderAuthMobile";
import { HeaderModals } from "./HeaderModal";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import HeaderBranchSelector from "./HeaderBranchSelector";
import { useCart } from "@/contexts/CartContext";
import { useCustomerOrderSummary } from "@/hooks/api/customers/useCustomerOrders";
import { IconButton } from "@/components/ui/buttons";

const Header = () => {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const router = useRouter();

  const { modal: modalType, openModal, closeModal } = useModalQuery();

  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const queryClient = useQueryClient();

  // Cart and active orders counts for mobile badges
  const { totalItems } = useCart();
  const { data: orderSummary } = useCustomerOrderSummary();
  const activeOrdersCount =
    (orderSummary?.pending ?? 0) +
    (orderSummary?.preparing ?? 0) +
    (orderSummary?.dispatch ?? 0) +
    (orderSummary?.completed ?? 0);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          closeModal();

          queryClient.removeQueries({ queryKey: ["orders"] }); // remove the orders cache
          toast.success("Logged out successfully");
          setIsLoggingOut(false);
          router.push("/");
        },
      },
    });
  };

  return (
    <header
      className={`sticky top-0 z-40 pt-2 bg-white transition-all duration-300 ${
        isScrolled ? "shadow-xl" : ""
      }`}
    >
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between lg:justify-around h-18 lg:h-20">
          <BrandLogo subdomain="food" />
          <HeaderBranchSelector />

          <HeaderNavLinks />

          <div className="flex items-center gap-2 sm:gap-4">
            <HeaderCartActions mounted={mounted} />

            <div className="hidden xl:flex items-center gap-2">
              <HeaderAuthDesktop
                sessionPending={sessionPending}
                session={session}
                isLoggingOut={isLoggingOut}
                onOpenModal={openModal}
              />
            </div>

            {/* Mobile menu toggle */}
            <div className="relative xl:hidden">
              <IconButton
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                variant="ghost"
                icon={{ name: isMobileMenuOpen ? "X" : "Menu", size: 24 }}
                className="rounded-lg"
              />
              {mounted && totalItems + activeOrdersCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-5 h-5 bg-brand-color-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce ${isMobileMenuOpen ? "hidden" : "md:hidden"}`}
                >
                  {totalItems + activeOrdersCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <HeaderMobileMenu
          session={session}
          isLoggingOut={isLoggingOut}
          onClose={() => setIsMobileMenuOpen(false)}
          onOpenModal={openModal}
          totalItems={totalItems}
          activeOrdersCount={activeOrdersCount}
          mounted={mounted}
        />
      )}

      <HeaderModals
        modalType={modalType}
        isLoggingOut={isLoggingOut}
        onClose={closeModal}
        onLogout={handleLogout}
      />
    </header>
  );
};

export default Header;
