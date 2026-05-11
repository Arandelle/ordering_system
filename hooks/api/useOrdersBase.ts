import { apiClient } from "@/lib/apiClient";
import { buildQueryString } from "@/lib/buildQueryString";
import { PaginationMeta } from "@/lib/query-helpers";
import { OrderType } from "@/types/OrderTypes";
import { useQuery } from "@tanstack/react-query";

interface ProductResponse {
  data: OrderType[];
  pagination: PaginationMeta;
}

const ORDER_ENDPOINTS = {
  admin: "/admin/orders/",
  customer: "/customer/orders/",
} as const;

export type OrderParams = {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: string;
  productType?: string;
};

export function useOrdersBase(
  type: keyof typeof ORDER_ENDPOINTS,
  params?: OrderParams,
) {
  return useQuery<ProductResponse, Error>({
    queryKey: ["orders", type, params],
    queryFn: () =>
      apiClient.get(`${ORDER_ENDPOINTS[type]}${buildQueryString(params)}`),
    staleTime: 30000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useOrderBase(type: keyof typeof ORDER_ENDPOINTS, id: string) {
  return useQuery<OrderType, Error>({
    queryKey: ["orders", type, id],
    queryFn: () => apiClient.get(`${ORDER_ENDPOINTS[type]}${id}`),
    staleTime: 30000,
    enabled: !!id,
  });
}