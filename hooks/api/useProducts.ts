// =========================
// QUERIES (GET data)
// ============================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { Product, ProductPayload } from "@/types/products";
import { PaginationMeta } from "@/utils/query-helpers";
import { buildQueryString } from "@/utils/buildQueryString";

/**
 * Fetch all product
 *
 * How it works
 * 1. First call: Fetches from API, shows loading
 * 2. Subsequent calls: Returns cached data instanly
 * 3. Background : Refetches if data is stale
 *
 */

interface ProductResponse {
  data: Product[];
  pagination: PaginationMeta;
}

export const useProducts = (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: string;
  productType?: string;
  isPopular?: string;
  activeOnly?: boolean;
}) => {
  return useQuery<ProductResponse, Error>({
    // unique key for this query - like an ID for the cache
    queryKey: ["products", params],

    // Function that fetches the data
    queryFn: () => apiClient.get<ProductResponse>(`/products${buildQueryString(params)}`),

    // Optional: Custom settings for this specific query
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};

/**
 * Fetch single product by ID
 *
 * The querykey inludes ID, so each product gets its own cache entry.
 * API returns { data: Product } — this hook unwraps it so consumers
 * get the Product directly via `data`.
 */

export const useProduct = (id: string) => {
  return useQuery<Product, Error>({
    queryKey: ["products", id], // ['products', '123'] is different from ['products', '456']
    queryFn: async () => {
      const response = await apiClient.get<{ data: Product }>(`/products/${id}`);
      return response.data;
    },
    enabled: !!id, // Only run query if ID exists
  });
};

// ============================================
// MUTATIONS (CREATE/UPDATE/DELETE data)
// ============================================

/**
 * Create a new product
 *
 * Mutations handle side effects and cache updates
 */

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // The actual API call
    mutationFn: (productData: ProductPayload) =>
      apiClient.post("/products", productData),

    // what happens after successful creation
    onSuccess: () => {
      // Invalidate products cache - forces a refetch
      // This ensures the list shows the new product
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },

    // What happens if creation fails
    onError: (error: any) => {
      console.log(error?.message);
      toast.error(error?.message || "Something went wrong");
    },
  });
};

/**
 * Update an existing product
 *
 * Shows optimistic updates - UI updates before API responds
 */

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  type mutationProps = {
    id: string;
    data: ProductPayload; // ✅ not Partial — all fields are sent on update
  };

  return useMutation({
    mutationFn: ({ id, data }: mutationProps) =>
      apiClient.put(`/products/${id}`, data),

    onMutate: async ({ id, data }) => {
      // Cancel all product-related queries (list + individual)
      await queryClient.cancelQueries({ queryKey: ["products"] });

      // Snapshot all matching product queries for rollback
      const snapshot = queryClient.getQueriesData<ProductResponse>({
        queryKey: ["products"],
      });

      // Optimistically update every matching product list cache
      queryClient.setQueriesData<ProductResponse>(
        { queryKey: ["products"] },
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((p): Product => {
              if (p._id !== id) return p;
              return {
                ...p,
                name: data.name,
                price: data.price,
                info: data.info ?? p.info,
                description: data.description ?? p.description,
                isSignature: data.isSignature ?? p.isSignature,
                isPopular: data.isPopular ?? p.isPopular,
                isActive: data.isActive ?? p.isActive,
                isComingSoon: data.isComingSoon ?? p.isComingSoon,
                isOnlineExclusive: data.isOnlineExclusive ?? p.isOnlineExclusive,
                goLiveDate: data.goLiveDate ?? p.goLiveDate,
                productType: data.productType,
                paxCount: data.paxCount ?? p.paxCount,
                // Preserve populated objects — payload only has ObjectId strings
                // or different shapes, but the cache holds full populated objects
                image: p.image,
                category: p.category,
                subcategory: p.subcategory,
                modifierGroups: p.modifierGroups,
              };
            }),
          };
        },
      );

      return { snapshot };
    },

    onError: (_err, _variables, context) => {
      // Rollback all product queries to their pre-mutation snapshots
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          if (data !== undefined) {
            queryClient.setQueryData(key, data);
          }
        }
      }
      toast.error("Failed to update product");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
};

/**
 * Delete a product
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete product!");
    },
  });
};

// ── Bulk update payload shape ─────────────────────────────────────────────────

export interface BulkUpdatePayload {
  ids: string[];
  updates: {
    category?: string;
    subcategory?: string | null;
    price?: number | null;
    isActive?: boolean;
    isComingSoon?: boolean;
    goLiveDate?: string | null;
    isOnlineExclusive?: boolean;
    isPopular?: boolean;
    isSignature?: boolean;
  };
}

export interface BulkUpdateResponse {
  success: boolean;
  modifiedCount: number;
  matchedCount: number;
}

/**
 * Bulk-update shared attributes (category, price, toggles) across multiple products.
 */
export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();

  return useMutation<BulkUpdateResponse, Error, BulkUpdatePayload>({
    mutationFn: (payload) => apiClient.put("/products/bulk", payload),
    onSuccess: (data) => {
      toast.success(`${data.modifiedCount} product${data.modifiedCount !== 1 ? "s" : ""} updated`);
    },
    onError: () => {
      toast.error("Failed to bulk update products");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
};
