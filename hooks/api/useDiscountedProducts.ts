import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { BranchProduct } from "@/hooks/api/useBranchProductInfinite";
import { buildQueryString } from "@/utils/buildQueryString";
import type { PaginationMeta } from "@/utils/query-helpers";

export type DiscountedProductsResponse = {
  success: boolean;
  branchId: string | null;
  data: BranchProduct[];
  pagination: PaginationMeta;
};

export function useDiscountedProducts(params?: {
  branchId?: string;
  limit?: number;
  enabled?: boolean;
}) {
  return useInfiniteQuery<DiscountedProductsResponse, Error>({
    queryKey: ["discounted-products", params],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<DiscountedProductsResponse>(
        `/customer/discounted-products${buildQueryString({
          branchId: params?.branchId,
          page: Number(pageParam),
          limit: params?.limit ?? 8,
        })}`,
      ),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: params?.enabled ?? true,
    staleTime: 60_000,
  });
}
