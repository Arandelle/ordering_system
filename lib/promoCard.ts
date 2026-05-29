export const PROMO_CARD = {
  name: "Harrison Promo Card",
  discountRate: 0.3,
  purchasePrice: 100,
  sku: "HARRISON-PROMO-CARD",
} as const;

export function calculatePromoCardDiscount(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return Number((subtotal * PROMO_CARD.discountRate).toFixed(2));
}

export function calculatePromoCardTotal(subtotal: number): number {
  const discount = calculatePromoCardDiscount(subtotal);
  return Number(Math.max(subtotal - discount, 0).toFixed(2));
}
