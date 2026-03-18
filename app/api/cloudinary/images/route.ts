import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function GET(){
    const result = await cloudinary.api.resources({
        type: "upload",
        max_results: 50,
        resource_type: "image"
    });

    return NextResponse.json(result); // { resources: [...]}
}