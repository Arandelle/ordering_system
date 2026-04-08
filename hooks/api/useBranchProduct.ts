import { apiClient } from "@/lib/apiClient";
import { Product } from "@/types/products";
import { StockStatus } from "@/types/inventory_types";
import { useQuery } from "@tanstack/react-query";

export type BranchProduct = Product & {
  quantity?: number;
  status?: StockStatus;
};

export type BranchProductResponse = {
  success: boolean;
  branchId: string;
  totalProducts: number;
  data: BranchProduct[];
};


export const useBranchProduct = (branchId: string) => {
  return useQuery({
    queryKey: ["branch_product", branchId],
    queryFn: async () => {
      const res = await apiClient.get<BranchProductResponse>(
        `/customer/branch/products?branchId=${branchId}`,
      );
      return res.data;
    },
    enabled: !!branchId,
  });
};
