import { COOKIE_NAMES } from "@/lib/getAuth";
import {NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rateLimit";

async function _POST() {
  try {
    const response = NextResponse.json({ message: "Logout!" });
    response.cookies.delete(COOKIE_NAMES.ADMIN_TOKEN);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to logout",
      },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(_POST, "api");
