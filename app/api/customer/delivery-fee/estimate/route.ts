import { connectDB } from "@/lib/mongodb";
import { resolveEffectiveDeliveryFeeFromCoordinates } from "@/lib/deliveryFee";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { isValidCoordinate } from "@/helper/isValidCoordinates";
import { fetchBranch } from "@/services/branch/branch.service";

type DeliveryFeeEstimateBody = {
  branchId?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  itemSubtotalAmount?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DeliveryFeeEstimateBody;
    const { branchId, coordinates, itemSubtotalAmount } = body;
    const deliveryCoordinates = {
      lat: Number(coordinates?.lat),
      lng: Number(coordinates?.lng),
    };

    if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
      return NextResponse.json(
        { error: "Valid branchId is required." },
        { status: 400 },
      );
    }

    if (!isValidCoordinate(deliveryCoordinates.lat, deliveryCoordinates.lng)) {
      return NextResponse.json(
        { error: "Valid delivery coordinates are required." },
        { status: 400 },
      );
    }

    // Item subtotal must be a non-negative number for free delivery eligibility check.
    const subtotal = Number(itemSubtotalAmount ?? 0);
    if (subtotal < 0) {
      return NextResponse.json(
        { error: "itemSubtotalAmount must be a non-negative number." },
        { status: 400 },
      );
    }

    await connectDB();

    const branch = await fetchBranch(branchId);

    if (!branch.location?.coordinates) {
      return NextResponse.json(
        { error: "Branch coordinates are not available." },
        { status: 404 },
      );
    }

    // Resolve effective delivery fee including free delivery eligibility.
    const estimate = resolveEffectiveDeliveryFeeFromCoordinates(
      branch.location.coordinates,
      deliveryCoordinates,
      subtotal,
    );

    return NextResponse.json({ data: estimate });
  } catch (err: any) {
    // Surface fetchBranch errors (not found, inactive, opening soon) with appropriate status
    if (err.message?.includes("not found")) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err.message?.includes("inactive") || err.message?.includes("opening soon")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to estimate delivery fee." },
      { status: 500 },
    );
  }
}
