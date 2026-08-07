import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/getAuth";
import { withRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

async function _GET(request: NextRequest) {
  try {
    
    await requireAdmin(request);
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "products/",
      max_results: 50,
      resource_type: "image",
    });

    return NextResponse.json(result); // { resources: [...]}
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch cloudinary images",
      },
      { status: 500 },
    );
  }
}

export const GET = withRateLimit(_GET, "write");
