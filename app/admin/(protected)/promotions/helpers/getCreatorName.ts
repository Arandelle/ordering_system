import type { PromotionCreator } from "../types/discount-promotion.type";

export function getCreatorName(promotion: { createdBy?: PromotionCreator }) {
  const creator = promotion.createdBy;
  if (!creator) return "Unknown";

  const fullName = [creator.firstName, creator.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || creator.email || "Unknown";
}
