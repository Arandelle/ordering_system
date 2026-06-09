import { PROMOTION_TYPES } from "@/types/promotions/promotion-constant";
import { AdminPromotionBase, ProductSnapshot } from "../../types/discount-promotion.type";

export type BundleDiscountPromotion = AdminPromotionBase & {
  promotionType: typeof PROMOTION_TYPES.BUNDLE_DISCOUNT;
  products: (ProductSnapshot & { quantity: number })[];
};

export type BundleDiscountPromotionsResponse = {
  data: BundleDiscountPromotion[];
};

export type BundleDiscountPromotionMutationResponse = {
  promotion: BundleDiscountPromotion;
};