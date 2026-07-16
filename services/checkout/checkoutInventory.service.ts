// ---------------------------------------------------------------------------
// Cart helpers
// ---------------------------------------------------------------------------

import { Inventory } from "@/models/Inventory";
import { Product } from "@/models/Product";
import { CreateOrderPayload } from "@/types/OrderTypes";
import { addMoney, multiplyMoney } from "@/lib/money";
import mongoose, { ClientSession } from "mongoose";

/** Shape of modifier selections passed through from the cart payload */
interface CartModifierSelection {
  groupId: string;
  groupName: string;
  isMain: boolean;
  linkedToGroupId: string | null;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  maxQty: number;
  items: {
    productId: string;
    name: string;
    label: string | null;
    upgradePrice: number;
    quantity: number;
  }[];
}

/** A single Maya line item for a modifier upgrade */
export interface MayaModifierLineItem {
  name: string;
  quantity: number;
  code: string;
  description: string;
  amount: { value: number };
  totalAmount: { value: number; currency: string };
}

export interface ResolvedCartItem {
  orderItem: {
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    description: string;
    info?: string;
    image: string;
    category: string;
    quantity: number;
    modifierSelections: CartModifierSelection[];
  };
  /** Parent product at base price — Maya shows this as one line item */
  mayaItem: {
    productId: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    code: string;
    description: string;
    info?: string;
    amount: { value: number };
    totalAmount: { value: number; currency: string };
  };
  /** Each modifier upgrade as its own Maya line item (only those with upgradePrice > 0) */
  mayaModifierItems: MayaModifierLineItem[];
  subtotal: number;
}

/**
 * Compute the total upgrade price from modifier selections for a single unit.
 * Each modifier item's upgradePrice is multiplied by its own quantity.
 */
function computeModifierUpgradeTotal(
  modifierSelections?: CartModifierSelection[],
): number {
  if (!modifierSelections || modifierSelections.length === 0) return 0;

  return modifierSelections.reduce((sum, group) => {
    const groupTotal = group.items.reduce(
      (gSum, modItem) =>
        addMoney(gSum, multiplyMoney(modItem.upgradePrice, modItem.quantity)),
      0,
    );
    return sum + groupTotal;
  }, 0);
}

async function resolveCartItem(
  cartItem: {
    _id: string;
    quantity: number;
    modifierSelections?: CartModifierSelection[];
  },
  branchId: string,
  session: ClientSession,
): Promise<ResolvedCartItem> {
  if (!cartItem._id || !cartItem.quantity)
    throw new Error("Invalid cart item.");

  const product = await Product.findById(cartItem._id).session(session);
  if (!product) throw new Error("Product not found!");

  const inventory = await Inventory.findOne({
    productId: cartItem._id,
    branchId,
    $expr: {
      $gte: [
        { $subtract: ["$quantity", { $sum: "$reservations.quantity" }] },
        cartItem.quantity,
      ],
    },
  }).session(session);

  if (!inventory)
    throw new Error(
      `${product.name} is out of stock or insufficient quantity.`,
    );

  // For combo/set products, the unit price = base product price + all modifier upgrades.
  // We recalculate server-side to prevent price manipulation from the frontend.
  const modifierSelections = cartItem.modifierSelections ?? [];
  const upgradeTotalPerUnit = computeModifierUpgradeTotal(modifierSelections);
  const unitPrice = addMoney(product.price, upgradeTotalPerUnit);
  const lineTotal = multiplyMoney(unitPrice, cartItem.quantity);

  // Base product line total for Maya (at base price, without upgrades)
  const baseLineTotal = multiplyMoney(product.price, cartItem.quantity);

  // Build separate Maya line items for each modifier upgrade.
  // Includes zero-price upgrades as "(Included)" so the customer sees the full breakdown.

  const mayaModifierItems: MayaModifierLineItem[] = [];

  for (const group of modifierSelections) {
    for (const mi of group.items) {
      const qty = mi.quantity * cartItem.quantity;
      if (mi.upgradePrice > 0) {
        const modLineTotal = multiplyMoney(mi.upgradePrice, qty);
        mayaModifierItems.push({
          name: `${mi.label ?? mi.name}`,
          quantity: qty,
          code: `UPGRADE-${mi.productId}`,
          description: `Upgrade for ${product.name} — ${group.groupName}`,
          amount: { value: mi.upgradePrice },
          totalAmount: {
            value: modLineTotal,
            currency: "PHP",
          },
        });
      } else {
        // Zero-price upgrade: use nominal amount so Maya renders the line item,
        // totalAmount stays 0 to keep the grand total correct.
        mayaModifierItems.push({
          name: `${mi.label ?? mi.name} (Included)`,
          quantity: qty,
          code: `UPGRADE-${mi.productId}`,
          description: `Included with ${product.name} — ${group.groupName}`,
          amount: { value: 1 },
          totalAmount: {
            value: 0,
            currency: "PHP",
          },
        });
      }
    }
  }

  // Handle zero-price base product (e.g. free promo item):
  // Use nominal amount so Maya renders it, totalAmount stays 0.
  const isFreeProduct = product.price === 0;

  return {
    orderItem: {
      productId: product._id,
      name: product.name,
      price: unitPrice,
      description: product.description,
      info: product.info,
      image: product.image.url,
      category: product.category,
      quantity: cartItem.quantity,
      modifierSelections,
    },
    mayaItem: {
      productId: product._id,
      name: isFreeProduct ? `${product.name} (FREE)` : product.name,
      quantity: cartItem.quantity,
      code: String(product._id),
      description: isFreeProduct
        ? `Free item — ${product.description ?? ""}`.trim()
        : (product.description ?? ""),
      info: product.info,
      amount: { value: isFreeProduct ? 1 : product.price },
      totalAmount: {
        value: baseLineTotal,
        currency: "PHP",
      },
    },
    mayaModifierItems,
    subtotal: lineTotal,
  };
}

export async function resolveCart(
  items: CreateOrderPayload["items"],
  branchId: string,
  session: ClientSession,
) {
  const resolved = await Promise.all(
    items.map((item) => resolveCartItem(item, branchId, session)),
  );

  const totalPrice = resolved.reduce((sum, r) => sum + r.subtotal, 0);
  const orderItems = resolved.map((r) => r.orderItem);
  // Flatten: parent product line item + each modifier upgrade as its own Maya line item
  const mayaItems = resolved.flatMap((r) => [
    r.mayaItem,
    ...r.mayaModifierItems,
  ]);

  return { totalPrice, orderItems, mayaItems };
}

export async function reserveInventory(
  orderItems: ResolvedCartItem["orderItem"][],
  branchId: string,
  orderId: mongoose.Types.ObjectId,
  session: ClientSession,
) {
  for (const item of orderItems) {
    const updated = await Inventory.findOneAndUpdate(
      {
        productId: item.productId,
        branchId,
        "reservations.orderId": { $ne: orderId }, // idempotent
        $expr: {
          $gte: [
            { $subtract: ["$quantity", { $sum: "$reservations.quantity" }] },
            item.quantity,
          ],
        },
      },
      { $push: { reservations: { orderId, quantity: item.quantity } } },
      { new: true, session },
    );

    // null = already reserved (retry) OR out of stock — check which
    if (!updated) {
      const existing = await Inventory.findOne({
        productId: item.productId,
        branchId,
        "reservations.orderId": orderId,
      }).session(session);

      if (!existing) {
        throw new Error(
          `${item.name} is out of stock or insufficient quantity.`,
        );
      }
      // else: already reserved for this order (retry), continue
    }
  }
}
