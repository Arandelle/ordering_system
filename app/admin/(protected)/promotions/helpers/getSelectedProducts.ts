import { CategoryOption } from "../types/discount-promotion.type";

// Used for product discount promotion to get the selected products based on the selected product ids and categories
export function getSelectedProducts(
  categories: CategoryOption[],
  productIds: string[],
) {
  const selectedIds = new Set(productIds);

  return categories
    .flatMap((category) => category.products)
    .filter((product) => selectedIds.has(product._id));
}