import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User, Settings } from "@/models";
import { requireBetterAuth } from "@/lib/getAuth";
import {
  isCityAllowedForDelivery,
  CITY_RESTRICTION_MESSAGE,
} from "@/lib/deliveryArea";
import { isValidCoordinate } from "@/helper/isValidCoordinates";
import { getBadRequestError, getInternalServerError, getNotFoundError } from "@/lib/getApiError";
import { withRateLimit } from "@/lib/rateLimit";
import { addressLine1Schema, zipCodeSchema, landmarkSchema } from "@/lib/validations";
import { z } from "zod";

type AddressInput = {
  line1?: string;
  line2?: string;
  city?: string;
  cityCode?: string;
  province?: string;
  region?: string;
  zipCode?: string;
  country?: string;
  landmark?: string;
  placeName?: string;
  town?: string;
  municipality?: string;
  suburb?: string;
  city_district?: string;
  coordinates?: {
    lat?: unknown;
    lng?: unknown;
  } | null;
};

// ─── Address validation schema ───────────────────────────────────────────────

const addressValidationSchema = z.object({
  line1: addressLine1Schema,
  zipCode: zipCodeSchema,
  landmark: landmarkSchema, // Already optional in validations.ts
});

async function _GET(request: Request) {
  try{
  const customer = await requireBetterAuth(request);

  await connectDB();

  const user = await User.findOne({ _id: customer?._id })
    .select("shippingAddress")
    .lean();

  return NextResponse.json({ shippingAddress: user?.shippingAddress ?? null });
  } catch(error){
    return getInternalServerError(error, "Failed to fetch shipping address. Please try again!.")
  }

}

async function _PUT(req: Request) {
  const customer = await requireBetterAuth(req);

  const body = (await req.json()) as { address?: unknown };
  const { address } = body;

  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return getBadRequestError("Address is required");
  }

  const addressPayload = address as AddressInput;

  // Validate address fields (line1, zipCode, landmark)
  const validationResult = addressValidationSchema.safeParse({
    line1: addressPayload.line1,
    zipCode: addressPayload.zipCode,
    landmark: addressPayload.landmark,
  });

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return getBadRequestError(firstError.message);
  }

  const coordinates = addressPayload.coordinates;

  if (coordinates) {
    if (!isValidCoordinate(coordinates.lat, coordinates.lng)) {
      return getBadRequestError("Valid delivery coordinates are required");
    }

    // Validate city against admin-configured delivery areas.
    const settings = await Settings.findOne().lean();
    const deliveryAreas = settings?.deliveryAreas ?? [];

    if (!isCityAllowedForDelivery(addressPayload.cityCode, deliveryAreas)) {
      return getBadRequestError(CITY_RESTRICTION_MESSAGE);
    }
  }

  await connectDB();

  const user = await User.findOneAndUpdate(
    { _id: customer._id },
    { $set: { shippingAddress: addressPayload } },
    { new: true, select: "shippingAddress" },
  ).lean();

  if (!user) {
    return getNotFoundError("User not found");
  }

  return NextResponse.json({ success: true, address: user.shippingAddress });
}

export const GET = withRateLimit(_GET, "api");
export const PUT = withRateLimit(_PUT, "write");
