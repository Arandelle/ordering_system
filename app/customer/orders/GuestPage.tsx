import { syne } from "@/app/font";
import { InputField } from "@/components/ui/InputField";
import { MODAL_TYPES, useModalQuery } from "@/hooks/utils/useModalQuery";
import { apiClient } from "@/lib/apiClient";
import { DynamicIcon } from "@/lib/DynamicIcon";
import { OrdersApiResponse } from "@/types/OrderTypes";
import { useState } from "react";
import { toast } from "sonner";
import OrderDetails from "./OrderDetails";
import { OrderDetailsModal } from "./GuestOrderModal";
import Modal from "@/components/ui/Modal";

export const GuestOrderLookup = () => {
  const { openModal: handleOpenModal } = useModalQuery();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [foundOrder, setFoundOrder] = useState<
    OrdersApiResponse["data"][number] | null
  >(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = referenceNumber.trim();
    if (!trimmed) return;

    setIsSearching(true);
    try {
      const response = await apiClient.get<OrdersApiResponse>(
        `/customer/orders/guest?ref=${encodeURIComponent(trimmed)}`,
      );
      const order = response.data[0] ?? null;
      if (!order) {
        toast.error("No order found with that reference number.");
      } else {
        setFoundOrder(order);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className={`${syne.className} min-h-[70vh] bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4`}
    >
      <div className="w-full max-w-md">
        {/* Illustration / Icon */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-brand-color-100 flex items-center justify-center mb-4 shadow-inner">
            <DynamicIcon
              name="ShoppingBag"
              size={38}
              className="text-brand-color-500"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Track Your Order
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            You&apos;re not signed in. Enter your order reference number below
            to check your order status, or{" "}
            <button
              onClick={() => handleOpenModal(MODAL_TYPES.LOGIN)}
              className="text-brand-color-500 font-semibold hover:underline cursor-pointer"
            >
              log in
            </button>{" "}
            to see all your orders.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <InputField
              label="Order Reference Number"
              leftIcon={
                <DynamicIcon name="Hash" size={16} className="text-slate-400" />
              }
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. ORD-20240410-XXXX"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              You can find this in your order confirmation email.
            </p>

            <button
              type="submit"
              disabled={!referenceNumber.trim() || isSearching}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-color-500 hover:bg-[#c13500] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-md"
            >
              {isSearching ? (
                <DynamicIcon
                  name="Loader2"
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <DynamicIcon name="Search" size={16} />
              )}
              {isSearching ? "Searching..." : "Find My Order"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col items-center gap-3">
            <p className="text-sm text-slate-500">Have an account?</p>
            <button
              onClick={() => handleOpenModal(MODAL_TYPES.LOGIN)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-300 hover:border-brand-color-500 hover:text-brand-color-500 text-slate-700 font-semibold text-sm transition-all"
            >
              <DynamicIcon name="LogIn" size={16} />
              Sign In to View All Orders
            </button>
          </div>
        </div>
      </div>

      {foundOrder && (
        <Modal
          onClose={() => setFoundOrder(null)}
          title="Order Details"
          subTitle="Your order details"
          contentClassName="p-4"
        >
          <OrderDetailsModal order={foundOrder} />
        </Modal>
      )}
    </div>
  );
};
