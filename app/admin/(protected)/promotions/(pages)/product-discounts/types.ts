import type {
  PROMOTION_TYPES,
} from "@/types/promotions/promotion-constant";
import { AdminPromotionBase, ProductSnapshot } from "../../types/discount-promotion.type";

export type { PromotionStatus } from "@/types/promotions/promotion-constant";

export type ProductDiscountPromotion = AdminPromotionBase & {
  promotionType: typeof PROMOTION_TYPES.PRODUCT_DISCOUNT,
  products: ProductSnapshot[]
}

export type ProductDiscountPromotionsResponse = {
  data: ProductDiscountPromotion[];
};

export type ProductDiscountPromotionMutationResponse = {
  promotion: ProductDiscountPromotion;
};
