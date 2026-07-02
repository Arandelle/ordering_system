import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

type BranchCapacityResponse = {
  canAcceptOrders: boolean;
  reason?: "high_demand";
  message?: string;
  activeOrderCount?: number;
  maxActiveOrders?: number;
};

/**
 * Check whether a branch can currently accept new orders.
 * Pickup orders only check isBusy — no capacity counting.
 * Delivery orders check full capacity (order count vs limit).
 */
export function useBranchCapacity(branchId: string | null, fulfillmentType: string | null) {
  return useQuery<BranchCapacityResponse, Error, BranchCapacityResponse>({
    queryKey: ["branchCapacity", branchId, fulfillmentType],
    queryFn: () =>
      apiClient.get<BranchCapacityResponse>(
        `/customer/branch/capacity?branchId=${branchId}&fulfillmentType=${fulfillmentType}`,
      ),
    enabled: !!branchId && !!fulfillmentType,
    staleTime: 1000 * 30, // 30 seconds — capacity can change quickly
    refetchInterval: 1000 * 60, // Poll every 60s while the user is on the page
    select: (res) => res,
  });
}
