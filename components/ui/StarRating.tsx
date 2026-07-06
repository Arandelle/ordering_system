import React from "react";
import { DynamicIcon } from "./DynamicIcon";

/** Horizontal bar chart for rating distribution */
export const RatingDistributionBar = ({
  distribution,
  total,
}: {
  distribution: Record<number, number>;
  total: number;
}) => {
  if (total === 0) return null;
  return (
    <div className="space-y-1">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] || 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-right text-stone-500">{star}</span>
            <DynamicIcon
              name="Star"
              size={10}
              className="fill-yellow-400 text-yellow-400"
            />
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-stone-500">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

const StarRatingDisplay = ({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <DynamicIcon
        name="Star"
        key={s}
        size={size}
        className={
          rating >= s
            ? "fill-yellow-400 text-yellow-400"
            : rating >= s - 0.5
              ? "fill-yellow-400/50 text-yellow-400"
              : "fill-gray-200 text-gray-300"
        }
      />
    ))}
  </span>
);
export default StarRatingDisplay;
