import { getAPIError } from "@/lib/getApiError";
import { getAdminAuth, requireSuperAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { Branch } from "@/models/Branch";
import { STAFF_ROLES } from "@/types/staff";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAdminAuth(request).catch(() => null);

    const filter = user?.role === STAFF_ROLES.SUPERADMIN ? {} : { isActive: true };

    const data = await Branch.find(filter).sort({ openingSoon: 1, createdAt: -1 }).lean();

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("GET /api/branches error: ", error);
    return getAPIError(error, 500, {fallbackMessage: "Failed to fetch branches"});
  }
}

const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required").trim(),
  address: z.string().min(1, "Address is required").trim(),
  location: z.object({
    coordinates: z
      .array(z.number())
      .length(2, "Coordinates must be [longitude, latitude]"),
  }),
  openingSoon: z.boolean().default(false),
  isBusy: z.boolean().default(false),
  maxActiveOrders: z.number().min(1).nullable().default(null),
  maxReservationsPerHour: z.number().min(1).nullable().default(null),
  maxReservationsPerDay: z.number().min(1).nullable().default(null),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    await requireSuperAdmin(request);

    const body = await request.json();
    const parsed = branchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, address, location, openingSoon, isBusy, maxActiveOrders, maxReservationsPerHour, maxReservationsPerDay } = parsed.data;

    // Generate unique branch code
    const count = await Branch.countDocuments();
    const code = `BR-${String(count + 1).padStart(3, "0")}`;

    const data = await Branch.create({
      name,
      code,
      address,
      location: {
        type: "Point",
        coordinates: location.coordinates, // [longitue, latitude] as GeoJSON format
      },
      openingSoon,
      isBusy,
      maxActiveOrders,
      maxReservationsPerHour,
      maxReservationsPerDay,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/branches error:", error);
    return getAPIError(error, 500, {fallbackMessage: "Failed to create branch"});
  }
}
