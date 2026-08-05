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

type AddressInput = {
  city?: string;
  cityCode?: string;
  town?: string;
  municipality?: string;
  suburb?: string;
  city_district?: string;
  coordinates?: {
    lat?: unknown;
    lng?: unknown;
  } | null;
};

export async function GET(request: Request) {
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

export async function PUT(req: Request) {
  const customer = await requireBetterAuth(req);

  const body = (await req.json()) as { address?: unknown };
  const { address } = body;

  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return getBadRequestError("Address is required");
  }

  const addressPayload = address as AddressInput;
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
