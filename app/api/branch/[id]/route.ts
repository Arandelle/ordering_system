import { getAPIError } from "@/lib/getApiError";
import { requireSuperAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { Branch } from "@/models/Branch";
import { NextRequest, NextResponse } from "next/server";

// GET single branch by ID — used by the edit page
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!id) {
      return getAPIError("Branch id is required", 400);
    }

    const branch = await Branch.findById(id).lean();

    if (!branch) {
      return getAPIError("Branch not found", 404);
    }

    return NextResponse.json(branch);
  } catch (error) {
    console.error("GET /api/branch/[id] error:", error);
    return getAPIError(error, 500, { fallbackMessage: "Failed to fetch branch" });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await requireSuperAdmin(request);

    const { id } = await context.params;

    if (!id) {
        return getAPIError("Branch id is required", 400);
    }

    const branch = await Branch.findById(id);

    if (!branch) {
      return getAPIError("Branch not found", 404);
    }

    branch.isActive = !branch.isActive;
    await branch.save();

    return NextResponse.json(branch);
  } catch (error) {
    console.error("PATCH /api/branch/[id] error:", error);

    return getAPIError(error, 500, {fallbackMessage: "Failed to update branch status"});
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await requireSuperAdmin(request);

    const { id } = await context.params;
    const body = await request.json();

    if (!id) {
      return getAPIError("Branch id is required", 400);
    }

    const {
      name,
      address,
      location,
      deliveryRadiusKm,
      openingSoon,
      isBusy,
      maxActiveOrders,
      maxReservationsPerHour,
      maxReservationsPerDay,
    } = body;

    // Validate required fields — address is now a nested object
    if (!name?.trim() || !address?.line1?.trim() || !address?.city?.trim()) {
      return getAPIError("Branch name, address line 1, and city are required", 400);
    }

    // Validate location coordinates if provided
    if (
      location &&
      (!location.coordinates || location.coordinates.length !== 2)
    ) {
      return getAPIError(
        "Invalid coordinates. Expected [longitude, latitude",
        400,
      );
    }

    // Build update object with nested address
    const updatedData: any = {
      name,
      address: {
        line1: address.line1,
        city: address.city,
        cityCode: address.cityCode ?? "",
        barangayCode: address.barangayCode ?? "",
        province: address.province ?? "",
      },
      openingSoon: openingSoon ?? false,
      deliveryRadiusKm:
        deliveryRadiusKm === null || deliveryRadiusKm === ""
          ? null
          : Number(deliveryRadiusKm),
      ...(isBusy !== undefined && { isBusy }),
      ...(maxActiveOrders !== undefined && {
        maxActiveOrders:
          maxActiveOrders === null || maxActiveOrders === ""
            ? null
            : Math.max(1, Number(maxActiveOrders)),
      }),
      ...(maxReservationsPerHour !== undefined && {
        maxReservationsPerHour:
          maxReservationsPerHour === null || maxReservationsPerHour === ""
            ? null
            : Math.max(1, Number(maxReservationsPerHour)),
      }),
      ...(maxReservationsPerDay !== undefined && {
        maxReservationsPerDay:
          maxReservationsPerDay === null || maxReservationsPerDay === ""
            ? null
            : Math.max(1, Number(maxReservationsPerDay)),
      }),
    };

    // only update location if provided
    if (location) {
      updatedData.location = {
        type: "Point",
        coordinates: location.coordinates, // [longitude, latitude]
      };
    }

    const updated = await Branch.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return getAPIError("Branch not found", 404);
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PUT /api/branches/[id] error:", error);
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to update branch",
    });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await requireSuperAdmin(request);

    const { id } = await context.params;

    if (!id) {
      return getAPIError("Branch id is required", 400);
    }

    const deleted = await Branch.findByIdAndDelete(id);

    if (!deleted) {
      return getAPIError("Branch not found", 404);
    }

    return NextResponse.json(
      { message: "Branch deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/branches/[id] error:", error);
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to delete branch",
    });
  }
}
