import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rateLimit";

type ResendVerificationStatus = "sent" | "already_verified" | "not_found";

type BetterAuthUserRecord = {
  emailVerified?: boolean;
};

type ResendVerificationResponse = {
  status: ResendVerificationStatus;
};

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

async function _POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await mongoose.connection
      .collection<BetterAuthUserRecord>("user")
      .findOne(
        { email },
        {
          projection: {
            emailVerified: 1,
          },
        },
      );

    if (!user) {
      const response: ResendVerificationResponse = { status: "not_found" };
      return NextResponse.json(response, { status: 404 });
    }

    if (user.emailVerified) {
      const response: ResendVerificationResponse = {
        status: "already_verified",
      };
      return NextResponse.json(response, { status: 200 });
    }

    await auth.api.sendVerificationEmail({
      body: {
        email,
        callbackURL: "/verified",
      },
      headers: request.headers,
    });

    const response: ResendVerificationResponse = { status: "sent" };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to resend verification email", error);

    return NextResponse.json(
      { error: "Could not resend verification email. Please try again." },
      { status: 500 },
    );
  }
}

// Email sending — limit to 10 req/min per IP to prevent abuse
export const POST = withRateLimit(_POST, "auth");
