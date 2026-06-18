import { apiClient } from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ShippingAddressForm } from "@/types/address";
import { toast } from "sonner";

interface AddressResponse {
  shippingAddress: ShippingAddressForm | null
}

export const useMyAddress = () => {
    return useQuery<AddressResponse>({
        queryKey: ["user_address"],
         queryFn: () => apiClient.get("/customer/address"),
    retry: false, // don't retry on 401
    staleTime: 1000 * 60 * 5, // cache for 5 mins
    })
}

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ address }: { address: ShippingAddressForm }) =>
      apiClient.put("/customer/address", {address}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_address"] });
      toast.success("Address updated successfully!");
    },

    onError: (error: Record<string, string>) => {
      toast.error(error?.error ?? "Something went wrong.");
    },
  });
};
