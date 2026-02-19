"use client";

import { useOrder } from "@/contexts/OrderContext";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { OrderType } from "@/types/OrderTypes";
import { Package, Star } from "lucide-react";
import { toast } from "sonner";
import { FormTextarea } from "@/components/ui/form/FormTextArea";

const ReviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const { placedOrders, markAsReviewed } = useOrder();

  const [order, setOrder] = useState<OrderType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const [showAllItems, setShowAllItems] = useState(false);
  const ITEMS_TO_SHOW = 3;

  useEffect(() => {
    if (placedOrders.length === 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }

    const foundOrder = placedOrders.find((o) => o._id === params.id);
    if (foundOrder) {
      setOrder(foundOrder);
      setIsLoading(false);

      if (foundOrder.isReviewed) {
        toast.info("You've already reviewed this order!");
        router.push("/orders");
        return;
      }

      if (foundOrder.status !== "completed") {
        toast.warning("You can only review completed orders");
        router.push("/orders");
        return;
      }
    } else {
      setIsLoading(false);
      router.push("/orders");
    }
  }, [params.id, placedOrders, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mark order as reviewed
      markAsReviewed(params.id as string);

      toast.success("Thank you for your review!");
      router.push("/orders");
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Order not found...</div>
      </div>
    );
  }

  const displayRating = hoveredRating || rating;
  const labels = [
    "No rating",
    "Poor 😓",
    "Fair 😐",
    "Good 🙂",
    "Very Good 😋",
    "Excellent 😍",
  ];

  return (
    <div className=" bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[#e13e00] text-2xl md:text-3xl font-bold mb-2">
              Rate Your Experience
            </h1>
            <p className="text-slate-600 font-semibold">Order #{order.paymentInfo.referenceNumber}</p>
            <p className="text-sm text-gray-500 mt-1">
              Completed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Order Items Summary */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Your Order</h3>
            <div className="space-y-2">
              {(showAllItems ? order.items : order.items.slice(0, ITEMS_TO_SHOW)).map((item, idx) => (
                <div
                  key={`${item._id}-${idx}`}
                  className="flex gap-4 items-center"
                >
                  {/** Item Image */}
                  <div className="w-16 h-16 flex shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/** Item Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Quanity: {item.quantity}
                    </p>
                  </div>

                  {/**Item Price */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[#e13e00]">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₱{item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}


              {/** View more/less button */}
              {order.items.length > ITEMS_TO_SHOW && (
                <button
                type="button"
                onClick={() => setShowAllItems(!showAllItems)}
                className="w-full py-2 text-sm text-[#e13e00] hover:text-[#c13500] font-semibold transition-colors cursor-pointer"
                >
                  {showAllItems ? "Show Less" : `+${order.items.length - ITEMS_TO_SHOW} More Items`}
                </button>
              )}
            </div>
            <div className="border-t mt-4 pt-3 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span className="text-[#e13e00]">
                ₱{order.total.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="flex flex-col space-y-6">
              <label className="font-[550] text-gray-700">
                How was your experience? <span className="text-red-500">*</span>
              </label>
              {/** Stars */}
              <div className="flex items-center justify-center gap-2 py-4 group">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className={`transition-transform focus:outline-none active:scale-150 cursor-pointer ${
                      star <= displayRating ? "group-hover:scale-110" : ""
                    }`}
                  >
                    <Star
                      className="w-12 h-12 transition-all duration-200"
                      fill={star <= displayRating ? "#e13e00" : "#e5e7eb"}
                      stroke={star <= displayRating ? "#c13500" : "#d1d5db"}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>

              {/** Rating Label */}
              {displayRating > 0 && (
                <p className="text-center text-lg font-semibold text-[#e13e00]">
                  {labels[displayRating]}
                </p>
              )}
            </div>

            {/* Comment */}

            <FormTextarea
              label="Share Your Thoughts (Optional)"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love? What could be better?"
              rows={5}
            />

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="flex-1 bg-[#e13e00] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#c13500] transition-colors disabled:bg-gray-300 disabled:hover:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Your feedback helps us improve our service
        </p>
      </div>
    </div>
  );
};

export default ReviewPage;
