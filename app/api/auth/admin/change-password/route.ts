import { connectDB } from "@/lib/mongodb";
import Staff from "@/models/Staff";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/getAuth";
import { z } from "zod";

/** Schema for admin self-password-change (no current password needed since session is valid). */
const changePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number",
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Password must contain at least one symbol",
    }),
});

/**
 * POST /api/auth/admin/change-password
 * Allows an authenticated admin to change their own password.
 * Session is validated via the admin_token cookie, so current password is not required.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify the admin is authenticated and active
    const admin = await requireAdmin(request);

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { newPassword } = parsed.data;

    // Hash and update the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Staff.updateOne(
      { _id: admin._id },
      { $set: { password: hashedPassword } },
    );

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to change password",
      },
      { status: 500 },
    );
  }
}
