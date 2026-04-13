import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { VerificationEmail } from "@/app/emails/VerificationEmail";

export async function POST(req: NextRequest) {
  try {
    const { fullname, email, password, phone } = await req.json();

    // ── Validate required fields ──────────────────────────────────────
    if (!fullname || !email || !password) {
      return NextResponse.json(
        { error: "fullname, email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // ── Check if email already exists ─────────────────────────────────
    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    // ── Hash password ─────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Generate verification token ───────────────────────────────────
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // ── Create customer ───────────────────────────────────────────────
    const customer = await Customer.create({
      fullname,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      isEmailVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpiry: tokenExpiry,
    });

    // ── Send verification email ───────────────────────────────────────
    const verifyUrl = `${process.env.NEXT_PUBLIC_URL}/api/auth/customer/verify-email?token=${rawToken}&email=${email.toLowerCase()}`;

    const { error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Verify your email — Harrisin House of Inasal & BBQ",
      react: VerificationEmail({
        name: fullname,
        verifyUrl,
        expiryHours: 24,
      }),
    });

    if (emailError) {
      // Roll back — delete the customer if email failed
      await Customer.findByIdAndDelete(customer._id);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[register]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}