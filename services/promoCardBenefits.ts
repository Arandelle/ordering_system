import {
  getPromoCardDay,
  getPromoCardDiscountRateForDay,
  PromoCardDiscountRule,
  PromoCardVoucherRule,
} from "@/lib/promoCard";
import { getPromoCardConfig } from "@/lib/promoCardConfig";
import { PromoCardPurchase } from "@/models/PromoCardPurchase";
import { Voucher } from "@/models/Voucher";
import {
  DEFAULT_VOUCHER_VALIDITY_RULE,
  DEFAULT_VOUCHER_USAGE_RULE,
  VoucherValidityRule,
} from "@/types/voucher.types";
import { roundMoney } from "@/lib/money";
import mongoose, { ClientSession } from "mongoose";

type PromoCardBenefit = {
  discountRate: number;
  discountCode: string;
  voucherRule?: PromoCardVoucherRule;
};

type OrderForVoucherAward = {
  _id: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId | string | null;
  total?: {
    totalAmount?: number;
    subtotalAmount?: number;
  };
};

function generateVoucherCode(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${prefix}-${timestamp}-${random}`;
}

function calculateVoucherExpiresAt(
  validFrom: Date,
  validityRule?: VoucherValidityRule,
): Date {
  const rule = validityRule ?? DEFAULT_VOUCHER_VALIDITY_RULE;
  const expiresAt = new Date(validFrom);

  if (rule.unit === "minute") {
    expiresAt.setMinutes(expiresAt.getMinutes() + rule.duration);
  } else if (rule.unit === "hour") {
    expiresAt.setHours(expiresAt.getHours() + rule.duration);
  } else if (rule.unit === "day") {
    expiresAt.setDate(expiresAt.getDate() + rule.duration);
  } else if (rule.unit === "month") {
    expiresAt.setMonth(expiresAt.getMonth() + rule.duration);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + rule.duration);
  }

  return expiresAt;
}

function activeVoucherWindowFilter(now = new Date()) {
  return {
    $and: [
      {
        $or: [
          { validFrom: { $exists: false } },
          { validFrom: null },
          { validFrom: { $lte: now } },
        ],
      },
      {
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: now } },
        ],
      },
    ],
  };
}

export async function getPaidPromoCardBenefit(
  customerId: string | mongoose.Types.ObjectId | null,
  session?: ClientSession,
): Promise<PromoCardBenefit | null> {
  if (!customerId) return null;

  const config = await getPromoCardConfig();
  if (!config.enabled) return null;

  const query = PromoCardPurchase.findOne({
    customerId,
    status: "paid",
  }).sort({ paidAt: -1, createdAt: -1 });

  if (session) query.session(session);

  const paidPromoCard = await query.lean<{
    referenceNumber: string;
    discountRate: number;
    discountRules?: PromoCardDiscountRule[];
    voucherRule?: PromoCardVoucherRule;
  }>();

  if (!paidPromoCard) return null;

  const discountRate = getPromoCardDiscountRateForDay(
    paidPromoCard.discountRules,
    getPromoCardDay(),
    paidPromoCard.discountRate,
  );

  return {
    discountRate,
    discountCode: paidPromoCard.referenceNumber,
    voucherRule: paidPromoCard.voucherRule,
  };
}

export async function awardPromoCardVoucherForOrder(
  order: OrderForVoucherAward,
  session?: ClientSession,
): Promise<void> {
  if (!order.customerId) return;

  const benefit = await getPaidPromoCardBenefit(order.customerId, session);
  const voucherRule = benefit?.voucherRule;

  if (!voucherRule?.enabled) return;

  const eligibleAmount = order.total?.totalAmount ?? 0;
  if (eligibleAmount < voucherRule.minimumPurchase) return;

  const validFrom = new Date();
  const expiresAt = calculateVoucherExpiresAt(
    validFrom,
    voucherRule.validityRule,
  );

  await Voucher.updateOne(
    {
      sourceType: "promo_card",
      sourceId: order._id,
      customerId: order.customerId,
    },
    {
      $setOnInsert: {
        customerId: order.customerId,
        code: generateVoucherCode("PROMO"),
        sourceType: "promo_card",
        sourceId: order._id,
        originalAmount: voucherRule.voucherAmount,
        remainingAmount: voucherRule.voucherAmount,
        minimumPurchase: voucherRule.minimumPurchase,
        usageRule: voucherRule.usageRule ?? DEFAULT_VOUCHER_USAGE_RULE,
        validityRule: voucherRule.validityRule ?? DEFAULT_VOUCHER_VALIDITY_RULE,
        issuedAt: validFrom,
        validFrom,
        expiresAt,
        status: "active",
      },
    },
    { upsert: true, session },
  );
}

export async function getCustomerVoucherBalance(
  customerId: string | mongoose.Types.ObjectId | null,
): Promise<number> {
  if (!customerId) return 0;

  const result = await Voucher.aggregate<{ balance: number }>([
    {
      $match: {
        customerId: new mongoose.Types.ObjectId(String(customerId)),
        status: "active",
        remainingAmount: { $gt: 0 },
        ...activeVoucherWindowFilter(),
      },
    },
    { $group: { _id: null, balance: { $sum: "$remainingAmount" } } },
  ]);

  return result[0]?.balance ?? 0;
}

export async function redeemCustomerVoucher(
  customerId: string | mongoose.Types.ObjectId | null,
  requestedAmount: number,
  session: ClientSession,
): Promise<number> {
  if (!customerId || requestedAmount <= 0) return 0;

  let remaining = roundMoney(requestedAmount);
  let redeemed = 0;

  const vouchers = await Voucher.find({
    customerId,
    status: "active",
    remainingAmount: { $gt: 0 },
    ...activeVoucherWindowFilter(),
  })
    .sort({ expiresAt: 1, createdAt: 1 })
    .session(session);

  for (const voucher of vouchers) {
    if (remaining <= 0) break;

    const amount = Math.min(voucher.remainingAmount, remaining);
    voucher.remainingAmount = voucher.usageRule?.isOneTimeUse
      ? 0
      : roundMoney(voucher.remainingAmount - amount);
    voucher.status = voucher.remainingAmount <= 0 ? "used" : "active";
    voucher.usedAt = voucher.status === "used" ? new Date() : voucher.usedAt;
    await voucher.save({ session });

    redeemed = roundMoney(redeemed + amount);
    remaining = roundMoney(remaining - amount);
  }

  if (redeemed < requestedAmount) {
    throw new Error("Insufficient voucher balance.");
  }

  return redeemed;
}

export async function refundCustomerVoucher(
  customerId: string | mongoose.Types.ObjectId | null,
  amount: number,
  session?: ClientSession,
): Promise<void> {
  if (!customerId || amount <= 0) return;

  const validFrom = new Date();
  const validityRule = DEFAULT_VOUCHER_VALIDITY_RULE;

  await Voucher.create(
    [
      {
        customerId,
        code: generateVoucherCode("REFUND"),
        sourceType: "order_refund",
        originalAmount: amount,
        remainingAmount: amount,
        minimumPurchase: 0,
        usageRule: {
          isOneTimeUse: false,
          isConsumable: true,
        },
        validityRule,
        issuedAt: validFrom,
        validFrom,
        expiresAt: calculateVoucherExpiresAt(validFrom, validityRule),
        status: "active",
      },
    ],
    session ? { session } : undefined,
  );
}
