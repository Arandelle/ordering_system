import { PromotionDiscountDay, PromotionDiscountDayMode, PromotionDiscountType } from "@/types/promotions/promotion-constant";

export type PromotionCreator = {
  firstName?: string;
  lastName?: string;
  email?: string;
} | null;

export type AdminPromotionBase = {
  _id: string;
  enabled: boolean;
  name: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  categoryIds: string[];
  startsAt: string | Date;
  endsAt?: string | Date | null;
  dayMode: PromotionDiscountDayMode;
  days: PromotionDiscountDay[];
  startTime: string;
  endTime: string;
  maximumRedemptions: number | null;
  redemptionCount: number;
  createdBy?: PromotionCreator;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminPromotionSavePayload = {
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

export type AdminPromotionForm = {
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

export type ProductSnapshot = {
  product: string;
  name: string;
  price: number | null;
  imageUrl: string;
  category: string | null;
};

export type ProductOption = {
  _id: string;
  name: string;
  price: number | null;
  imageUrl: string;
};

export type CategoryOption<TProduct = ProductOption> = {
  _id: string;
  name: string;
  products: TProduct[];
};

export type DiscountOptionsResponse = {
  data: CategoryOption[];
};
