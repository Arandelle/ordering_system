import type { ProductDiscountPromotionConfig } from "@/types/promotions/product-discount.type";
import type {
  PromotionDiscountDay,
  PromotionDiscountDayMode,
  PromotionDiscountType,
} from "@/types/promotions/promotion-constant";

export type { PromotionStatus } from "@/types/promotions/promotion-constant";

export type ProductDiscountProduct = {
  product: string;
  name: string;
  price: number | null;
  imageUrl: string;
  category: string | null;
};

export type ProductDiscountPromotion = Omit<
  ProductDiscountPromotionConfig,
  "startsAt" | "endsAt" | "products"
> & {
  _id: string;
  products: ProductDiscountProduct[];
  startsAt: string | Date;
  endsAt?: string | Date | null;
  createdBy?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductDiscountPromotionsResponse = {
  data: ProductDiscountPromotion[];
};

export type ProductDiscountPromotionMutationResponse = {
  promotion: ProductDiscountPromotion;
};

export type ProductDiscountPromotionSavePayload = {
  enabled: boolean;
  name: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  productIds: string[];
  categoryIds: string[];
  startsAt: string | null;
  endsAt: string | null;
  dayMode: PromotionDiscountDayMode;
  days: PromotionDiscountDay[];
  startTime: string;
  endTime: string;
  maximumRedemptions: number | null;
};

export type ProductDiscountPromotionForm = {
  enabled: boolean;
  name: string;
  discountType: PromotionDiscountType;
  discountValue: string;
  productIds: string[];
  categoryIds: string[];
  startsAt: string;
  endsAt: string;
  dayMode: PromotionDiscountDayMode;
  days: PromotionDiscountDay[];
  startTime: string;
  endTime: string;
  maximumRedemptions: string;
};

export type ProductDiscountProductOption = {
  _id: string;
  name: string;
  price: number | null;
  imageUrl: string;
};

export type ProductDiscountCategoryOption = {
  _id: string;
  name: string;
  products: ProductDiscountProductOption[];
};

export type ProductDiscountOptionsResponse = {
  data: ProductDiscountCategoryOption[];
};
