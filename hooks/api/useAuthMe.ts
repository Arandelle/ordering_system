import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Staff } from "@/types/staff";

export const useAdminMe = () => {
  return useQuery<Staff>({
    queryKey: ["admin"],
    queryFn: () => apiClient.get("/auth/admin/me"),
    retry: false, // don't retry on 401
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });
};
