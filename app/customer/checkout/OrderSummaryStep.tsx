import OrderNowButton from "@/components/ui/OrderNowButton";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface OrderSummaryStepProps {
  onNext: () => void;
  onBack: () => void;
  onSetCheckoutUrl: (url: string) => void;
}

const OrderSummaryStep = ({
  onNext,
  onSetCheckoutUrl,
}: OrderSummaryStepProps) => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const router = useRouter();

  if (cartItems.length === 0) {
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
    try {
      // FRONTEND VALIDATION - Check minimum amount before API call
      const MINIMUM_AMOUNT = 100;

      if (totalPrice < MINIMUM_AMOUNT) {
        toast.error("Minimum Order Amount", {
          description: `Your order total is ₱${totalPrice.toFixed(2)}. The minimum amount for online payment is ₱${MINIMUM_AMOUNT.toFixed(2)}. Please add more items to your cart.`,
          duration: 6000,
        });
        return;
      }

      // Call PayMongo API to create payment link
      const response = await fetch("/api/paymongo/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(totalPrice + totalPrice * 0.12),
          description: `Harrison BBQ Order - ${new Date().toLocaleDateString()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Parse user-friendly error messages from PayMongo
        let userMessage = "Unable to create payment link. Please try again.";

        if (data.error?.errors && Array.isArray(data.error.errors)) {
          const errorDetails = data.error.errors[0];

          // Handle specific PayMongo error codes
          switch (errorDetails.code) {
            case "parameter_below_minimum":
              userMessage = `Order amount is below the minimum requirement of ₱100.00. Please add more items to your cart.`;
              break;
            case "parameter_above_maximum":
              userMessage = `Order amount exceeds the maximum limit. Please contact support.`;
              break;
            case "parameter_invalid":
              userMessage = `Invalid payment details. Please check your information and try again.`;
              break;
            case "authentication_failed":
              userMessage = `Payment service is temporarily unavailable. Please try again later or contact support.`;
              break;
            default:
              // Show the actual error detail if it's user-friendly
              if (errorDetails.detail && errorDetails.detail.length < 100) {
                userMessage = errorDetails.detail;
              }
          }
        } else if (data.error) {
          // Fallback for simple error messages
          userMessage =
            typeof data.error === "string" ? data.error : userMessage;
        }

        toast.error("Payment Error", {
          description: userMessage,
          duration: 6000,
        });

        throw new Error(userMessage);
      }

      // Validate the response has the checkout_url
      if (!data.checkout_url) {
        throw new Error(
          "Payment link was not generated. Please try again or contact support.",
        );
      }

      // Simulate order processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save payment link info for persistence
      localStorage.setItem(
        "active_payment",
        JSON.stringify({
          linkId: data.id,
          checkoutUrl: data.checkout_url,
          createdAt: Date.now(),
        }),
      );

      onNext();
      window.scrollTo(0, 0);
    } catch (error: any) {
      // Error already shown via toast
      console.error("Payment error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Summary</h2>
        <p className="text-gray-500">Review your items before proceeding.</p>
      </div>

      {/**Cart Items */}
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
                  <p className="text-sm text-gray-500">{item.category}</p>
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

      {/**Order Totals */}
      <div className="bg-gray-50 rounded-xl py-4 space-y-3">
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-xl text-[#e13e00]">
            ₱{totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <button
          onClick={() => {
            handlePlaceOrder();
          }}
          className="flex-1 bg-[#e13e00]/90 hover:bg-[#c13500] text-white py-3 rounded-full font-bold transition-colors cursor-pointer"
        >
          Place Order
        </button>
        <Link
          href={"/menu"}
           className="flex-1 text-gray-700 hover:text-gray-800 text-center py-4 rounded-xl font-semibold transition-colors cursor-pointer underline"
        >
          Need More?
        </Link> 
      </div>
    </div>
  );
};

export default OrderSummaryStep;
