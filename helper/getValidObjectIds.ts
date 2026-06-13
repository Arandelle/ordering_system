import mongoose, { Types } from "mongoose";

export function getValidObjectIds(ids: string[] | undefined) {
  if (!Array.isArray(ids)) return [];

  return [...new Set(ids)].filter((id) => mongoose.Types.ObjectId.isValid(id));
}

export const getValidObjectId = (id: unknown) => {
  const normalizeId = id?.toString();

  if (!normalizeId || !Types.ObjectId.isValid(normalizeId)) {
    return null;
  }

  return new Types.ObjectId(normalizeId);
};
