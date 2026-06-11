import mongoose from "mongoose";

export function getValidObjectIds(ids: string[] | undefined) {
  if (!Array.isArray(ids)) return [];

  return [...new Set(ids)].filter((id) => mongoose.Types.ObjectId.isValid(id));
}
