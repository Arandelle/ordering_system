import Modal from "@/components/ui/Modal";
import OrderNowButton from "@/components/ui/OrderNowButton";
import { useCart } from "@/contexts/CartContext";
import { useCreateOrder } from "@/hooks/useOrders";
import { CartItem } from "@/types/MenuTypes";
import { CheckCircle2, ExternalLink, Loader, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PENDING_CHECKOUT_KEY = "pendingCheckoutUrl";

type CartItemWithTotal = {
  cartItems: CartItem[];
  subTotal: number;
  tax: number;
  totalPrice: number
}

const OrderSummaryStep = () => {
  const { cartItems, removeFromCart, updateQuantity, subTotal, tax, totalPrice, clearCart } =
    useCart();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();
  const router = useRouter();
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");
  const [orderedItems, setOrderedItems] = useState<CartItemWithTotal | null>(null);

  // On mount: if there's a stored checkout URL (from a refresh mid-payment),
  // redirect to /orders immediately.
  useEffect(() => {
    const stored = localStorage.getItem(PENDING_CHECKOUT_KEY);
    if (stored) {
      localStorage.removeItem(PENDING_CHECKOUT_KEY);
      router.push("/orders");
    }
  }, []);

  if (cartItems.length === 0 && !checkoutUrl) {
    return (
      <div className="text-center p-12">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-400">Add your favourite before checking out!</p>
        <OrderNowButton />
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    const MINIMUM_AMOUNT = 100;

    if (totalPrice < MINIMUM_AMOUNT) {
      toast.warning("Minimum Order Amount", {
        description: `The minimum amount for online payment is ₱${MINIMUM_AMOUNT.toFixed(2)}.`,
        duration: 6000,
      });
      return;
    }

    try {
      const data = await createOrder({
        items: cartItems,
        subTotal: totalPrice,
      });

      if (!data.checkoutUrl) {
        throw new Error(
          "Payment link was not generated. Please try again or contact support.",
        );
      }

      // 1. Snapshot the cart before clearing so the modal can display the items
      setOrderedItems({
        cartItems,
        subTotal,
        tax,
        totalPrice
      });

      // 2. Show the modal by setting the URL
      setCheckoutUrl(data.checkoutUrl);

      // 3. Persist so a refresh redirects to /orders
      localStorage.setItem(PENDING_CHECKOUT_KEY, data.checkoutUrl);

      // 4. Clear the cart last
      clearCart();
    } catch (error: any) {
      console.error("Payment error:", error);
    }
  };

  const handleModalClose = () => {
    localStorage.removeItem(PENDING_CHECKOUT_KEY);
    setCheckoutUrl("");
    router.push("/orders");
  };

  const handlePayNow = () => {
    localStorage.removeItem(PENDING_CHECKOUT_KEY);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Summary</h2>
        <p className="text-gray-500">Review your items before proceeding.</p>
      </div>

      {!checkoutUrl && (
        <>
          {/* Cart Items */}
          <div className="space-y-4 max-h-[calc(100vh/2)] overflow-y-auto hide-scrollbar">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 bg-linear-to-br from-stone-100 via-amber-50 to-stone-100/50 rounded-xl p-4"
              >
                <img
                  src={item.image}
                  alt={item.name || "Product Image"}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.category?.name}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-semibold text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-[#e13e00]">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₱{subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>VAT (12%)</span>
              <span>₱{tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-xl text-[#e13e00]">
                ₱{totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <button
              onClick={handlePlaceOrder}
              disabled={isPending}
              className={`flex-1 text-white py-3 rounded-full font-bold transition-colors ${isPending ? "cursor-not-allowed bg-gray-400" : "cursor-pointer bg-[#e13e00]/90 hover:bg-[#c13500]"}`}
            >
              {!isPending ? (
                "Place Order"
              ) : (
                <span className="flex items-center gap-4 justify-center">
                  Placing Order... <Loader size={16} className="animate-spin" />
                </span>
              )}
            </button>
            <Link
              href={"/menu"}
              className="flex-1 text-gray-700 hover:text-gray-800 text-center py-4 rounded-xl font-semibold transition-colors cursor-pointer underline"
            >
              Need More?
            </Link>
          </div>
        </>
      )}

      {checkoutUrl && (
        <Modal title="Order Placed!" onClose={handleModalClose}>
          <div className="space-y-5">
            {/* Success header */}
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle2 size={22} className="text-green-500 shrink-0" />
              <p className="text-sm text-green-700 font-medium">
                Your order was successfully created. Complete payment to confirm it.
              </p>
            </div>

            {/* Ordered items list */}
            <div className="space-y-3 max-h-56 overflow-y-auto hide-scrollbar">
              {orderedItems?.cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 bg-stone-50 rounded-xl p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {item.name}
                    </p>
                    {item.category?.name && (
                      <p className="text-xs text-gray-400">{item.category.name}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                    <p className="text-sm font-bold text-[#e13e00]">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order totals */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₱{orderedItems?.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>VAT (12%)</span>
                <span>₱{orderedItems?.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">Order Total</span>
                <span className="text-lg font-bold text-[#e13e00]">
                  ₱{orderedItems?.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-1">
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePayNow}
                className="w-full flex items-center justify-center gap-2 bg-[#e13e00] hover:bg-[#c13500] active:scale-[0.98] text-white py-4 rounded-xl font-bold text-base shadow-md shadow-[#e13e00]/30 transition-all"
              >
                Pay Now <ExternalLink size={15} />
              </a>

              <button
                onClick={handleModalClose}
                className="mx-auto text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer py-1"
              >
                I'll pay later
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrderSummaryStep;