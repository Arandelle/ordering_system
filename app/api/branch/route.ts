import { connectDB } from "@/lib/mongodb";
import { Branch } from "@/models/Branch";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const data = await Branch.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET /api/branches error: ", error);
    return NextResponse.json(
      {
        error: "Failed to fetch branches",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, address, contactNumber, open, close, location } = body;

    // Validate required fields
    if (!name?.trim() || !address?.trim()) {
      return NextResponse.json(
        {
          error: "Branch name and address are required",
        },
        { status: 400 },
      );
    }

    // Validate location coordinates
    if (!location?.coordinates || location.coordinates.length !== 2) {
      return NextResponse.json(
        {
          error:
            "Valid location coordinates [longitude, latitude] are required",
        },
        { status: 400 },
      );
    }

    // Generate unique branch code
    const count = await Branch.countDocuments();
    const code = `BR-${String(count + 1).padStart(3, "0")}`;

    const data = await Branch.create({
      name,
      code,
      address,
      contactNumber,
      operatingHours: {
        open,
        close,
      },
      location: {
        type: "Point",
        coordinates: location.coordinates, // [longitue, latitude] as GeoJSON format
      },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/branches error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create branch",
      },
      { status: 500 },
    );
  }
}
