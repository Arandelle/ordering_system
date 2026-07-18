import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import { getAPIError } from "@/lib/getApiError";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/customer/upload-avatar
 * Uploads a customer's profile avatar to Cloudinary under the customer_profile folder.
 * Accepts a base64-encoded imageFile and an optional oldPublicId to destroy the previous image.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageFile, oldPublicId } = body;

    if (!imageFile) {
      return getAPIError("Image file is required", 400);
    }

    const image = await uploadToCloudinary(imageFile, {
      folder: "customer_profile",
      oldPublicId,
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to upload image",
    });
  }
}
