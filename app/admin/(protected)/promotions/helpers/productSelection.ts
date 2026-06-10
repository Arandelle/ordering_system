import { CategoryOption } from "../types/discount-promotion.type";

type ToggleCategoryProductsParams = {
  category: CategoryOption;
  checked: boolean;
  productIds: string[];
  categoryIds: string[];
};

export const toggleIdSelection = (selectedIds: string[], id: string) => {
  return selectedIds.includes(id)
    ? selectedIds.filter((selectedId) => selectedId !== id)
    : [...selectedIds, id];
};

export const toggleProduct = (productIds: string[], productId: string) =>
  toggleIdSelection(productIds, productId);

export const toggleCategoryExpansion = (
  expandedCategoryIds: string[],
  categoryId: string,
) => toggleIdSelection(expandedCategoryIds, categoryId);

export const toggleCategoryProducts = ({
  category,
  checked,
  productIds,
  categoryIds,
}: ToggleCategoryProductsParams) => {
  const categoryProductIds = category.products.map((product) => product._id);

  return {
    productIds: checked
      ? [...new Set([...productIds, ...categoryProductIds])]
      : productIds.filter((id) => !categoryProductIds.includes(id)),
    categoryIds:
      category._id === "uncategorized"
        ? categoryIds
        : checked
          ? [...new Set([...categoryIds, category._id])]
          : categoryIds.filter((id) => id !== category._id),
  };
};
