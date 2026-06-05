import { connectDB } from "@/lib/mongodb";
import { isPromotionScheduleActive } from "@/lib/promotions/promotions.service";
import { getStoreStatus } from "@/lib/storeStatus";
import { OrderDiscountPromotion } from "@/models/OrderDiscountPromotion";
import { Settings } from "@/models/Setting";
import type {
  ActivePromotion,
  ActivePromotionsResponse,
} from "@/types/promotions.type";
import type {
  PromotionDiscountDay,
  PromotionDiscountDayMode,
  PromotionDiscountType,
  PromotionTypes,
} from "@/types/promotions/promotion-constant";
import { NextResponse } from "next/server";

type OrderDiscountPromotionRecord = {
  _id: {
    toString: () => string;
  };
  enabled: boolean;
  name: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  maximumDiscountAmount?: number | null;
  minimumOrderAmount: number;
  startsAt: Date;
  endsAt?: Date | null;
  dayMode: PromotionDiscountDayMode;
  days: PromotionDiscountDay[];
  startTime: string;
  endTime: string;
  maximumRedemptions?: number | null;
  redemptionCount: number;
};

function isPromotionCurrentlyValid(
  promotion: OrderDiscountPromotionRecord,
  now: Date,
  operatingHours: Parameters<typeof getStoreStatus>[0] | null,
) {
  if (
    promotion.maximumRedemptions &&
    promotion.redemptionCount >= promotion.maximumRedemptions
  ) {
    return false;
  }

  return isPromotionScheduleActive(promotion, operatingHours, now);
}

function toActiveOrderDiscountPromotion(
  promotion: OrderDiscountPromotionRecord,
): ActivePromotion {
  return {
    id: promotion._id.toString(),
    promotionType: "order_discount" satisfies PromotionTypes,
    enabled: promotion.enabled,
    name: promotion.name,
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    maximumDiscountAmount: promotion.maximumDiscountAmount ?? null,
    minimumOrderAmount: promotion.minimumOrderAmount,
    startsAt: promotion.startsAt.toISOString(),
    endsAt: promotion.endsAt?.toISOString() ?? null,
    dayMode: promotion.dayMode,
    days: promotion.days,
    startTime: promotion.startTime,
    endTime: promotion.endTime,
    redemptionCount: promotion.redemptionCount,
    maximumRedemptions: promotion.maximumRedemptions ?? null,
  };
}

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const settings = await Settings.findOne().select({ operatingHours: 1 });
    const operatingHours = settings?.operatingHours ?? null;
    const promotions = await OrderDiscountPromotion.find({
      enabled: true,
      startsAt: { $lte: now },
      $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
    })
      .select({
        enabled: 1,
        name: 1,
        discountType: 1,
        discountValue: 1,
        maximumDiscountAmount: 1,
        minimumOrderAmount: 1,
        startsAt: 1,
        endsAt: 1,
        dayMode: 1,
        days: 1,
        startTime: 1,
        endTime: 1,
        maximumRedemptions: 1,
        redemptionCount: 1,
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean<OrderDiscountPromotionRecord[]>();

    const activePromotions = promotions
      .filter((promotion) =>
        isPromotionCurrentlyValid(promotion, now, operatingHours),
      )
      .map(toActiveOrderDiscountPromotion);

    return NextResponse.json(
      { data: activePromotions } satisfies ActivePromotionsResponse,
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch active promotions." },
      { status: 500 },
    );
  }
}
