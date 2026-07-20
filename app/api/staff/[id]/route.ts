import { getValidObjectId } from "@/helper/getValidObjectIds";
import { getAPIError } from "@/lib/getApiError";
import { requireSuperAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { updateStaffSchema } from "@/lib/validations";
import Staff from "@/models/Staff";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const admin = await requireSuperAdmin(request);

    const { id } = await context.params;

    if (!id || !getValidObjectId(id)) {
      return getAPIError("Valid staff id is required", 400);
    }

    if(admin._id.toString() === id){
      return getAPIError("You cannot update your own status", 400)
    }

    const staff = await Staff.findById(id);

    if (!staff) {
      return getAPIError("Staff not found!", 404);
    }

    staff.isActive = !staff.isActive;
    await staff.save();

    return NextResponse.json(staff);
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to update staffs status",
    });
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
      return getAPIError("Staff id is required", 400);
    }

    const parsed = updateStaffSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      return getAPIError(firstError, 400);
    }

    const { firstName, lastName, email, password, phone, role, branch } =
      parsed.data;

    const existing = await Staff.findById(id);
    if (!existing) {
      return getAPIError("Staff not found!", 404);
    }

    if (email && email !== existing.email) {
      const emailTaken = await Staff.findOne({ email, _id: { $ne: id } });

      if (emailTaken) {
        return getAPIError("Email already exists. Try another email.", 409);
      }
    }

    // Build update payload — Zod already converted empty branch → null and empty password → undefined
    const updatedFields: Record<string, any> = {
      firstName,
      lastName,
      email,
      phone,
      role,
      branch,
    };

    // Only hash if a new password was provided
    if (password) {
      updatedFields.password = await bcrypt.hash(password, 12);
    }

    const updated = await Staff.findByIdAndUpdate(id, updatedFields, {
      new: true,
      runValidators: true,
    })
      .populate("branch", "name code")
      .lean();

    // Strip password from response
    const { password: _, ...staff } = updated as any;

    return NextResponse.json(staff, { status: 200 });
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to update staff's details",
    });
  }
}
