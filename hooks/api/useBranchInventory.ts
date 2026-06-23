import { InventoryItem } from "@/types/inventory_types";
import { apiClient } from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAdminBranchContext } from "@/contexts/AdminBranchContext";
import { getBranchQuery } from "@/helper/getBranchQuery";

export const useBranchInventories = () => {
  const { selectedBranchId } = useAdminBranchContext();

  return useQuery({
    queryKey: ["inventory_sync", selectedBranchId],
    queryFn: () =>
      apiClient.get<InventoryItem[]>(
        `/staff/inventories${getBranchQuery(selectedBranchId)}`,
      ),
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
  const { selectedBranchId } = useAdminBranchContext();

  return useMutation<
    UpdateInventoryResponse,
    Error,
    { id: string; payload: UpdateInventoryPayload }
  >({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateInventoryPayload;
    }) =>
      apiClient.put(
        `/staff/inventories/${id}${getBranchQuery(selectedBranchId)}`,
        payload,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory_sync"] });
      queryClient.invalidateQueries({ queryKey: [selectedBranchId] });
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
  const { selectedBranchId } = useAdminBranchContext();

  return useMutation<BulkUpdateResponse, Error, BulkUpdateItem[]>({
    mutationFn: (items: BulkUpdateItem[]) =>
      apiClient.put(
        `/staff/inventories/bulk${getBranchQuery(selectedBranchId)}`,
        { items },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory_sync"] });
      queryClient.invalidateQueries({ queryKey: [selectedBranchId] });
    },
  });
};
