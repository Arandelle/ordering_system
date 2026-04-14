import { connectDB } from "@/lib/mongodb";
import { requireSuperAdmin } from "@/lib/getAuth";
import { SubCategory } from "@/models/SubCategory";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    await requireSuperAdmin(request);
    const { subcategories } = await request.json();
    await Promise.all(
      subcategories.map(({ id, position }: { id: string; position: number }) =>
        SubCategory.findByIdAndUpdate(id, { position })
      )
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof  Error ? error.message : "Failed to reorder" }, { status: 500 });
  }
}