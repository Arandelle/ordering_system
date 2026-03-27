import { InventoryItem } from "@/types/inventory_types"
import { apiClient } from "@/lib/apiClient"
import { useQuery } from "@tanstack/react-query"

export const useBranchInventories = () => {
    return useQuery({
        queryKey: ["inventory_sync"],
        queryFn: () => apiClient.get<InventoryItem[]>("/staff/inventories")
    })
}