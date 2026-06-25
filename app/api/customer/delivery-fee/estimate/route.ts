import { connectDB } from "@/lib/mongodb";
import { calculateDeliveryFeeFromCoordinates } from "@/lib/deliveryFee";
import { Branch } from "@/models/Branch";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { isValidCoordinate } from "@/helper/isValidCoordinates";

type DeliveryFeeEstimateBody = {
  branchId?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DeliveryFeeEstimateBody;
    const { branchId, coordinates } = body;
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

    await connectDB();

    const branch = await Branch.findById(branchId)
      .select("location isActive openingSoon")
      .lean<{
        location?: { coordinates?: [number, number] };
        isActive?: boolean;
        openingSoon?: boolean;
      }>();

    if (!branch) {
      return NextResponse.json(
        { error: "Branch not found." },
        { status: 404 },
      );
    }

    if (!branch.isActive) {
      return NextResponse.json(
        { error: "This branch is currently inactive." },
        { status: 403 },
      );
    }

    if (branch.openingSoon) {
      return NextResponse.json(
        { error: "This branch is opening soon and is not yet accepting orders." },
        { status: 403 },
      );
    }

    if (!branch.location?.coordinates) {
      return NextResponse.json(
        { error: "Branch coordinates are not available." },
        { status: 404 },
      );
    }

    // The client sends only the delivery pin; branch coordinates come from DB.
    const estimate = calculateDeliveryFeeFromCoordinates(
      branch.location.coordinates,
      deliveryCoordinates,
    );

    return NextResponse.json({ data: estimate });
  } catch {
    return NextResponse.json(
      { error: "Failed to estimate delivery fee." },
      { status: 500 },
    );
  }
}
