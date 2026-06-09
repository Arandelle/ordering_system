import {
  DEFAULT_PROMOTION_DISCOUNT,
  DEFAULT_PROMOTION_RULES,
  PROMOTION_TYPES,
  PromotionConfig,
} from "./promotion-constant";
import { ProductDiscountProductSnapshot } from "./product-discount.type";

export type BundleDiscountProductSnapshot = ProductDiscountProductSnapshot & {
  quantity: number;
};

type BundleDiscountPromotionConfig = PromotionConfig & {
  promotionType: typeof PROMOTION_TYPES.BUNDLE_DISCOUNT;
  products: BundleDiscountProductSnapshot[];
  categoryIds: string[];
};

export const DEFAULT_BUNDLE_PROMOTION_DISCOUNT: BundleDiscountPromotionConfig =
  {
    ...DEFAULT_PROMOTION_RULES,
    ...DEFAULT_PROMOTION_DISCOUNT,
    promotionType: PROMOTION_TYPES.BUNDLE_DISCOUNT,
    name: "Bundle Promotion",
    products: [],
    categoryIds: [],
  };
