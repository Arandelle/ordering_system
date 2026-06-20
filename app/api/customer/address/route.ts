import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireBetterAuth } from "@/lib/getAuth";
import {
  isWithinMetroManilaDeliveryArea,
  OUTSIDE_DELIVERY_AREA_MESSAGE,
} from "@/lib/deliveryArea";
import { isValidCoordinate } from "@/helper/isValidCoordinates";

type AddressInput = {
  coordinates?: {
    lat?: unknown;
    lng?: unknown;
  } | null;
};

export async function GET(request: Request) {
  const customer = await requireBetterAuth(request);

  await connectDB();

  const user = await User.findOne({ _id: customer?._id })
    .select("shippingAddress")
    .lean();

  return NextResponse.json({ shippingAddress: user?.shippingAddress ?? null });
}

export async function PUT(req: Request) {
  const customer = await requireBetterAuth(req);

  const body = (await req.json()) as { address?: unknown };
  const { address } = body;

  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  const addressPayload = address as AddressInput;
  const coordinates = addressPayload.coordinates;

  if (coordinates) {
    if (!isValidCoordinate(coordinates.lat, coordinates.lng)) {
      return NextResponse.json(
        { error: "Valid delivery coordinates are required." },
        { status: 400 },
      );
    }

    const deliveryCoordinates = {
      lat: coordinates.lat as number,
      lng: coordinates.lng as number,
    };

    if (!isWithinMetroManilaDeliveryArea(deliveryCoordinates)) {
      return NextResponse.json(
        { error: OUTSIDE_DELIVERY_AREA_MESSAGE },
        { status: 400 },
      );
    }
  }

  await connectDB();

  const user = await User.findOneAndUpdate(
    { _id: customer._id },
    { $set: { shippingAddress: addressPayload } },
    { new: true, select: "shippingAddress" },
  ).lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, address: user.shippingAddress });
}
