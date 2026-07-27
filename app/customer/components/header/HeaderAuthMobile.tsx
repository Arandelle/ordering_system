"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { apiClient } from "@/lib/apiClient";
import { authClient } from "@/lib/auth-client";
import { MODAL_TYPES, ModalType } from "@/hooks/utils/useModalQuery";
import { useQuery } from "@tanstack/react-query";
import { IconButton } from "@/components/ui/buttons";
import { AppImage } from "@/components/AppImage";

interface Props {
  session: ReturnType<typeof authClient.useSession>["data"];
  isLoggingOut: boolean;
  onClose: () => void;
  onOpenModal: (type: ModalType) => void;
  totalItems: number;
  activeOrdersCount: number;
  mounted: boolean;
}

export const HeaderMobileMenu = ({
  session,
  isLoggingOut,
  onClose,
  onOpenModal,
  totalItems,
  activeOrdersCount,
  mounted,
}: Props) => {
  const { setIsCartOpen } = useCart();
  const { data: promoCardConfig } = useQuery({
    queryKey: ["customer", "promo-card", "config"],
    queryFn: () =>
      apiClient.get<{ enabled: boolean }>("/customer/promo-card/config"),
    staleTime: 60_000,
  });

  return (
    <div className="xl:hidden fixed left-0 right-0 bottom-0 top-18 lg:top-20 z-40 bg-[#1a1a1a] border-t border-white/10 shadow-2xl flex flex-col">
      <div className="px-4 py-4 space-y-4 flex flex-col flex-1 min-h-0">
        {session?.user && (
          <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-brand-color-500 flex items-center justify-center text-white text-sm font-bold">
              <AppImage
                src={session.user.image ?? "/images/harrison_logo.png"}
                alt="Profile"
                className="rounded-full border border-gray-200"
              />
            </div>
            <div>
              <Link
                href="/profile"
                onClick={onClose}
                className="underline text-white"
              >
                {session.user.name}
              </Link>
              <p className="text-white text-sm font-semibold"></p>
              <p className="text-gray-400 text-xs">{session.user.email}</p>
            </div>
          </div>
        )}
        {/* Nav links — scrollable area */}
        <div className="flex-1 overflow-y-auto gap-4 flex flex-col lg:hidden">
          <Link
            href="/orders"
            onClick={onClose}
            className="relative text-white md:hidden hover:bg-brand-color-500 p-3 rounded transition-colors"
          >
            Orders
            {activeOrdersCount > 0 && (
              <span className="absolute top-1 right-2 w-5 h-5 bg-brand-color-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {activeOrdersCount}
              </span>
            )}
          </Link>
          <div className="relative md:hidden">
            <IconButton
              onClick={() => {
                setIsCartOpen(true);
                onClose();
              }}
              text="My Cart"
              className="w-full rounded-lg bg-transparent p-3 justify-start relative"
            />
            {mounted && totalItems > 0 && (
              <span className="absolute top-1 right-2 w-5 h-5 bg-brand-color-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          {promoCardConfig?.enabled && (
            <Link
              href="/promo-card"
              onClick={onClose}
              className="text-white hover:bg-brand-color-500 p-3 rounded transition-colors"
            >
              Promo Card
            </Link>
          )}
          {/**Hidden for the meantime until futher notice */}
          <Link
            href="/catering"
            onClick={onClose}
            className="hidden text-white hover:bg-brand-color-500 p-3 rounded transition-colors"
          >
            Catering
          </Link>
          <Link
            href="/contact"
            onClick={onClose}
            className="text-white hover:bg-brand-color-500 p-3 rounded transition-colors"
          >
            Contact Us
          </Link>
        </div>

        {session?.user && (
          <IconButton
            onClick={() => {
              onClose();
              onOpenModal(MODAL_TYPES.LOGOUT);
            }}
            disabled={isLoggingOut}
            variant="danger"
            text="Logout"
            icon={{
              name: isLoggingOut ? "Loader2" : "LogOut",
              size: 16,
              className: isLoggingOut ? "animate-spin" : "",
            }}
            className="justify-start p-3 rounded-lg"
          />
        )}

        {/* Auth section — always pinned to the bottom */}
        <div className="py-4">
          {!session?.user && (
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <IconButton
                onClick={() => {
                  onOpenModal(MODAL_TYPES.LOGIN);
                  onClose();
                }}
                icon={{ name: "LogIn", size: 18 }}
                variant="outline"
                text="Login"
                className="rounded-lg p-3 text-white hover:bg-gray-50 hover:text-gray-900"
              />
              <IconButton
                onClick={() => {
                  onOpenModal(MODAL_TYPES.SIGNUP);
                  onClose();
                }}
                icon={{ name: "User", size: 18 }}
                text="Signup"
                className="rounded-lg p-3"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
