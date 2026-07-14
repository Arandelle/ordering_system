import mongoose, { Types } from "mongoose";
import { connectDB } from "./mongodb";
import { assertNonEmptyArray } from "@/utils/assertNonEmptyArray";
import { getValidObjectId } from "@/helper/getValidObjectIds";

interface ReorderItem {
  id: string;
  position: number;
}

/**
 * Validates a reorder payload: non-empty array, valid ObjectIds,
 * positive integer positions, no duplicate IDs or positions.
 */
export function validateReorderPayload(
  items: ReorderItem[],
  resourceName: string,
): ReorderItem[] {
  assertNonEmptyArray(
    items,
    `${resourceName} array is required and must not be empty`,
  );

  const ids = new Set<string>();
  const positions = new Set<number>();

  return items.map(({ id, position }) => {
    if (!getValidObjectId(id)) {
      throw new Error(`Invalid ID: ${id}`);
    }
    if (!Number.isInteger(position) || position < 1) {
      throw new Error(
        `Invalid position for ${id}: ${position}. Must be a positive integer.`,
      );
    }
    if (ids.has(id)) {
      throw new Error(`Duplicate ID detected: ${id}`);
    }
    if (positions.has(position)) {
      throw new Error(`Duplicate position detected: ${position}`);
    }
    ids.add(id);
    positions.add(position);
    return { id, position };
  });
}

/**
 * Reorder top-level documents (Category, SubCategory) using a MongoDB transaction.
 * Ensures all-or-nothing — if any update fails, the entire reorder is rolled back.
 */
export async function reorderDocuments(
  Model: mongoose.Model<any>,
  items: ReorderItem[],
  resourceName: string,
): Promise<void> {
  await connectDB();

  const validated = validateReorderPayload(items, resourceName);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Promise.all(
      validated.map(({ id, position }) =>
        Model.findByIdAndUpdate(id, { position }, { session }),
      ),
    );
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Convenience function: connectDB + validate + reorder + return success response.
 * Reduces boilerplate in route handlers for top-level document reorder.
 */
export async function handleReorderRequest(
  Model: mongoose.Model<any>,
  items: ReorderItem[],
  resourceName: string,
): Promise<{ success: string }> {
  await reorderDocuments(Model, items, resourceName);
  return { success: `${resourceName} reordered successfully!` };
}

/**
 * Reorder sub-documents within a parent document's array field.
 * Used for modifier groups within a Product, or items within a ModifierGroupTemplate.
 * Atomically replaces the entire array with the reordered version (single document update).
 *
 * For sub-documents WITH _id (like ModifierGroupSchema which has _id: true),
 * items are identified by their sub-document _id.
 */
export async function reorderSubDocuments(
  ParentModel: mongoose.Model<any>,
  parentId: string,
  arrayField: string,
  items: ReorderItem[],
  resourceName: string,
): Promise<void> {
  await connectDB();

  if (!getValidObjectId(parentId)) {
    throw new Error(`Invalid parent ID: ${parentId}`);
  }

  const validated = validateReorderPayload(items, resourceName);

  const parent = await ParentModel.findById(parentId);
  if (!parent) {
    throw new Error(`Parent document not found`);
  }

  const currentArray = parent[arrayField] as mongoose.Types.Subdocument[];

  // Build a map from _id -> sub-document for quick lookup
  const subDocMap = new Map<string, mongoose.Types.Subdocument>();
  for (const doc of currentArray) {
    subDocMap.set(doc._id.toString(), doc);
  }

  // Validate all referenced sub-document IDs exist
  for (const { id } of validated) {
    if (!subDocMap.has(id)) {
      throw new Error(`Sub-document ${id} not found in ${arrayField}`);
    }
  }

  // Reorder: sort by desired position, update position field on each
  const sortedUpdates = validated.sort((a, b) => a.position - b.position);
  const reordered = sortedUpdates.map(({ id, position }) => {
    const subDoc = subDocMap.get(id)!;
    (subDoc as any).position = position;
    return subDoc;
  });

  parent[arrayField] = reordered;
  await parent.save();
}

/**
 * Reorder nested sub-documents: items within a sub-document within a parent.
 * Used for modifier items within a modifier group within a Product.
 *
 * Since items (ModifierItemSchema) have _id: false, items are identified
 * by their `product` ObjectId field (unique within a group — the selection
 * modal prevents duplicates).
 *
 * Atomically replaces the nested items array (single parent document update).
 */
export async function reorderNestedSubDocuments(
  ParentModel: mongoose.Model<any>,
  parentId: string,
  parentArrayField: string,
  parentSubDocId: string,
  nestedArrayField: string,
  items: { product: string; position: number }[],
  resourceName: string,
): Promise<void> {
  await connectDB();

  if (!getValidObjectId(parentId)) {
    throw new Error(`Invalid parent ID: ${parentId}`);
  }
  if (!getValidObjectId(parentSubDocId)) {
    throw new Error(`Invalid group ID: ${parentSubDocId}`);
  }

  // Validate items payload
  assertNonEmptyArray(
    items,
    `${resourceName} array is required and must not be empty`,
  );

  const positions = new Set<number>();
  const validatedItems = items.map(({ product, position }) => {
    if (!getValidObjectId(product)) {
      throw new Error(`Invalid item product ID: ${product}`);
    }
    if (!Number.isInteger(position) || position < 1) {
      throw new Error(`Invalid position for item ${product}: ${position}`);
    }
    if (positions.has(position)) {
      throw new Error(`Duplicate position detected: ${position}`);
    }
    positions.add(position);
    return { product, position };
  });

  const parent = await ParentModel.findById(parentId);
  if (!parent) {
    throw new Error(`Parent document not found`);
  }

  const group = parent[parentArrayField].find(
    (doc: any) => doc._id.toString() === parentSubDocId,
  );
  if (!group) {
    throw new Error(`Sub-document (group) not found`);
  }

  // Build map from product ObjectId -> item
  const itemMap = new Map<string, any>();
  for (const item of group[nestedArrayField]) {
    itemMap.set(item.product.toString(), item);
  }

  // Validate all referenced products exist in the group
  for (const { product } of validatedItems) {
    if (!itemMap.has(product)) {
      throw new Error(`Item with product ${product} not found in group`);
    }
  }

  // Reorder: sort by desired position, update position field
  const sortedUpdates = validatedItems.sort(
    (a: any, b: any) => a.position - b.position,
  );
  const reordered = sortedUpdates.map((update: any) => {
    const item = itemMap.get(update.product)!;
    return { ...item.toObject(), position: update.position };
  });

  group[nestedArrayField] = reordered;
  await parent.save();
}
