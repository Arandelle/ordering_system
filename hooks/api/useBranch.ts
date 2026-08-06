// hooks/useBranch.ts
import { apiClient } from "@/lib/apiClient";
import { Branch, BranchFormData } from "@/types/branch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Converts BranchFormData (with string coordinates) to API payload
 * Transforms location from { latitude: string, longitude: string }
 * to GeoJSON format: { type: "Point", coordinates: [lng, lat] }
 */
const formatBranchFormDataForAPI = (formData: BranchFormData) => {
  const { location, isBusy, codEnabled, maxActiveOrders, maxReservationsPerHour, maxReservationsPerDay, deliveryRadiusKm, address, ...rest } = formData;

  const payload = {
    ...rest,
    address: {
      line1: address.line1 || "",
      city: address.city || "",
      cityCode: address.cityCode || "",
      barangayCode: address.barangayCode || "",
      province: address.province || "Metro Manila",
    },
    ...(location?.latitude &&
      location?.longitude && {
        location: {
          type: "Point" as const,
          coordinates: [
            parseFloat(location.longitude), // GeoJSON order: [longitude, latitude]
            parseFloat(location.latitude),
          ],
        },
      }),
    ...(isBusy !== undefined && { isBusy }),
    ...(codEnabled !== undefined && { codEnabled }),
    ...(maxActiveOrders !== undefined && { maxActiveOrders }),
    ...(maxReservationsPerHour !== undefined && { maxReservationsPerHour }),
    ...(maxReservationsPerDay !== undefined && { maxReservationsPerDay }),
    deliveryRadiusKm,
  };

  return payload;
};

/**
 * Converts API Branch data to BranchFormData for editing
 * Transforms GeoJSON coordinates back to string format
 */
const formatBranchDataForForm = (branch: Branch): BranchFormData => {
  return {
    name: branch.name,
    address: {
      line1: branch.address?.line1 ?? "",
      city: branch.address?.city ?? "",
      cityCode: branch.address?.cityCode ?? "",
      barangayCode: branch.address?.barangayCode ?? "",
      province: branch.address?.province ?? "Metro Manila",
    },
    location:
      branch.location?.coordinates && branch.location.coordinates.length === 2
        ? {
            longitude: branch.location.coordinates[0].toString(), // GeoJSON: [lng, lat]
            latitude: branch.location.coordinates[1].toString(),
          }
        : undefined,
    deliveryRadiusKm: branch.deliveryRadiusKm ?? null,
    openingSoon: branch.openingSoon ?? false,
    isBusy: branch.isBusy ?? false,
    codEnabled: branch.codEnabled ?? "global",
    maxActiveOrders: branch.maxActiveOrders ?? null,
    maxReservationsPerHour: branch.maxReservationsPerHour ?? null,
    maxReservationsPerDay: branch.maxReservationsPerDay ?? null,
  };
};

// fetch branches
export const useBranches = () => {
  return useQuery<Branch[], Error>({
    queryKey: ["branches"],
    queryFn: () => apiClient.get("/branch"),
  });
};

// Fetch a single branch by ID
export const useBranch = (id: string | null) => {
  return useQuery<Branch, Error>({
    queryKey: ["branch", id],
    queryFn: () => apiClient.get(`/branch/${id}`),
    enabled: !!id,
  });
};

// Create branch
export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation<Branch, { error: string }, BranchFormData>({
    mutationFn: (data) => {
      const payload = formatBranchFormDataForAPI(data);
      console.log("Creating branch with payload:", payload); // Debug
      return apiClient.post("/branch", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch created successfully!");
    },
    onError: (error) => {
      console.error("Create branch error:", error);
      toast.error(error?.error ?? "Something went wrong.");
    },
  });
};

// Update branch
export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation<Branch, { error: string }, { id: string; branchData: BranchFormData }>({
    mutationFn: ({ id, branchData }) => {
      const payload = formatBranchFormDataForAPI(branchData);
      console.log("Updating branch with payload:", payload); // Debug
      return apiClient.put(`/branch/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch updated successfully!");
    },
    onError: (error) => {
      console.error("Update branch error:", error);
      toast.error(error.error || "Failed to update branch");
    },
  });
};

// Toggle branch status
export const useToggleBranchStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Branch, Error, string>({
    mutationFn: (id) => apiClient.patch(`/branch/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch status updated!");
    },
    onError: (error) => {
      console.error("Toggle branch status error:", error);
      toast.error(error.message || "Failed to update branch status.");
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/branch/${id}`),
     onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch deleted successfully!");
    },
    onError: (error) => {
      console.error("Delete branch status error:", error);
      toast.error(error.message || "Failed to delete branch");
    },
  })
}

// Export helpers for use in components
export { formatBranchFormDataForAPI, formatBranchDataForForm };