import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import React from "react";

const OrderNowButton = () => {
  const router = useRouter();
  const { setIsCartOpen } = useCart();
  const navigateToOrder = () => {
    router.push("/");
    setIsCartOpen(false);
  };
  return (
    <button
      onClick={navigateToOrder}
      className="px-4 py-2 mt-4 rounded-xl bg-brand-color-500 hover:bg-brand-color-600 text-white transition-colors shadow-xl cursor-pointer"
    >
      Order Now!
    </button>
  );
};

export default OrderNowButton;
