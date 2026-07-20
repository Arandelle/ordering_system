import { InventoryItem } from "@/types/inventory_types";
import { apiClient } from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PaginationMeta } from "@/utils/query-helpers";
import { buildQueryString } from "@/utils/buildQueryString";

// ── Inventory list with pagination, search, filter, sort ─────────────────────

export interface InventoryCounts {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  total: number;
}

interface InventoryResponse {
  data: InventoryItem[];
  pagination: PaginationMeta;
  counts: InventoryCounts;
}

export interface InventoryQueryParams {
  branchId?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export const useBranchInventories = (params?: InventoryQueryParams) => {
  return useQuery<InventoryResponse, Error>({
    queryKey: ["inventory_sync", params],
    queryFn: () =>
      apiClient.get<InventoryResponse>(
        `/staff/inventories${buildQueryString(params)}`,
      ),
    staleTime: 15000,
  });
};

interface UpdateInventoryPayload {
  quantity?: number;
  reorderLevel?: number;
}

interface UpdateInventoryResponse {
  message: string;
  data: {
    productId: string;
    quantity: number;
    reorderLevel: number;
  };
}

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateInventoryResponse,
    Error,
    { id: string; payload: UpdateInventoryPayload; branchId?: string }
  >({
    mutationFn: ({ id, payload, branchId }) =>
      apiClient.put(
        `/staff/inventories/${id}${branchId ? `?branchId=${encodeURIComponent(branchId)}` : ""}`,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory_sync"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

interface BulkUpdateItem {
  productId: string;
  quantity?: number;
  reorderLevel?: number;
}

interface BulkUpdateResponse {
  message: string;
  updated: number;
}

export const useBulkUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    BulkUpdateResponse,
    Error,
    { items: BulkUpdateItem[]; branchId?: string }
  >({
    mutationFn: ({ items, branchId }) =>
      apiClient.put(
        `/staff/inventories/bulk${branchId ? `?branchId=${encodeURIComponent(branchId)}` : ""}`,
        { items },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory_sync"] });
    },
  });
};
