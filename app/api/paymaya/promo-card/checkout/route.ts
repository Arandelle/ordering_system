import { getAuthHeader } from "@/lib/getAuthHeader";
import { getMayaCheckoutUrl } from "@/lib/mayaConfig";
import { requireBetterAuth } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { getPromoCardConfig } from "@/lib/promoCardConfig";
import { PromoCardPurchase } from "@/models/PromoCardPurchase";
import { NextRequest, NextResponse } from "next/server";
import "@/lib/registerModels";
import { normalizeName } from "@/utils/normalizeName";
import { getAPIError, getInternalServerError } from "@/lib/getApiError";
import { withRateLimit } from "@/lib/rateLimit";

type PromoCardCheckoutBody = {
  firstName?: string;
  lastName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

function assertValidPromoCardPayload(
  body: PromoCardCheckoutBody,
): asserts body is Required<PromoCardCheckoutBody> {
  if (!body.firstName || !body.lastName) {
    throw new Error("Customer name is required.");
  }

  if (!body.customerEmail || !body.customerEmail.includes("@")) {
    throw new Error("A valid email is required.");
  }

  if (!body.customerPhone) {
    throw new Error("Customer phone is required.");
  }
}

async function _POST(request: NextRequest) {
  try {
    await connectDB();
    const customer = await requireBetterAuth(request);

    if (!customer?._id) {
      return getAPIError("Login is required to purchase a promo card.", 401);
    }

    const body = (await request.json()) as PromoCardCheckoutBody;
    assertValidPromoCardPayload(body);

    // Normalize customer names for consistent storage
    body.firstName = normalizeName(body.firstName);
    body.lastName = normalizeName(body.lastName);

    const activePromoCard = await PromoCardPurchase.findOne({
      customerId: customer._id,
      status: { $in: ["pending", "paid"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (activePromoCard) {
      return getAPIError(
        activePromoCard.status === "paid"
          ? "You already have an active promo card."
          : "You already have a pending promo card payment.",
        409,
        {
          extra: {
            referenceNumber: activePromoCard.referenceNumber,
            status: activePromoCard.status,
          },
        },
      );
    }

    const promoCardConfig = await getPromoCardConfig();
    if (!promoCardConfig.enabled) {
      return getAPIError(
        "Promo card is currently unavailable. Please contact marketing for final review.",
        409,
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL ?? request.nextUrl.origin;
    const referenceNumber = `PROMO-CARD-${Date.now()}`;
    const promoCardPurchase = await PromoCardPurchase.create({
      customerId: customer._id,
      referenceNumber,
      status: "pending",
      paymentStatus: "PENDING",
      firstName: body.firstName,
      lastName: body.lastName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      purchasePrice: promoCardConfig.purchasePrice,
      discountRate: promoCardConfig.discountRate,
      discountRules: promoCardConfig.discountRules,
      voucherRule: promoCardConfig.voucherRule,
    });

    const payload = {
      totalAmount: {
        value: promoCardConfig.purchasePrice,
        currency: "PHP",
        details: {
          discount: 0,
          vatAmount: 0,
          vatableSales: promoCardConfig.purchasePrice,
        },
      },
      items: [
        {
          name: promoCardConfig.name,
          quantity: 1,
          code: promoCardConfig.sku,
          description: `${(promoCardConfig.discountRate * 100).toFixed(0)}% discount card`,
          amount: { value: promoCardConfig.purchasePrice },
          totalAmount: {
            value: promoCardConfig.purchasePrice,
            currency: "PHP",
          },
        },
      ],
      buyer: {
        firstName: body.firstName,
        lastName: body.lastName,
        contact: {
          email: body.customerEmail,
          phone: body.customerPhone,
        },
      },
      redirectUrl: {
        success: `${baseUrl}/promo-card?payment=success&referenceNumber=${referenceNumber}`,
        failure: `${baseUrl}/promo-card?payment=failed&referenceNumber=${referenceNumber}`,
        cancel: `${baseUrl}/promo-card?payment=cancelled&referenceNumber=${referenceNumber}`,
      },
      requestReferenceNumber: referenceNumber,
    };

    try {
      const response = await fetch(getMayaCheckoutUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        checkoutId?: string;
        redirectUrl?: string;
        message?: string;
      };

      if (!response.ok || !data.redirectUrl) {
        throw new Error(data.message ?? "Maya promo card checkout failed.");
      }

      promoCardPurchase.checkoutId = data.checkoutId;
      await promoCardPurchase.save();

      return NextResponse.json(
        {
          referenceNumber,
          checkoutId: data.checkoutId,
          redirectUrl: data.redirectUrl,
        },
        { status: 201 },
      );
    } catch (error) {
      await PromoCardPurchase.updateOne(
        { _id: promoCardPurchase._id },
        {
          $set: {
            status: "failed",
            paymentStatus: "CHECKOUT_LINK_FAILED",
            failedAt: new Date(),
          },
        },
      );
      throw error;
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return getAPIError("You already have an active promo card request.", 409);
    }

    return getInternalServerError("Failed to create promo card checkout.");
  }
}

export const POST = withRateLimit(_POST, "write");
