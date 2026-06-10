import { AdminPromotionBase } from "../types/discount-promotion.type";

export function getCreatorName(promotion: AdminPromotionBase) {
  const creator = promotion.createdBy;
  if (!creator) return "Unknown";

  const fullName = [creator.firstName, creator.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || creator.email || "Unknown";
}