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
}) => {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        // how "full" this particular star should be, 0-100%
        const fillPct = Math.max(0, Math.min(1, rating - (s - 1))) * 100;

        return (
          <span
            key={s}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            {/* empty/background star */}
            <DynamicIcon
              name="Star"
              size={size}
              className="absolute inset-0 fill-gray-200 text-gray-300"
            />
            {/* filled star, clipped to fillPct width */}
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPct}%` }}
            >
              <DynamicIcon
                name="Star"
                size={size}
                className="fill-yellow-400 text-yellow-400"
              />
            </span>
          </span>
        );
      })}
    </span>
  );
};

export default StarRatingDisplay;
