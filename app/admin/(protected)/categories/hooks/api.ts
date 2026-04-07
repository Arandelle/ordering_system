import { apiClient } from "@/lib/apiClient";
import { Category } from "@/types/adminType";

// ── API helpers ───────────────────────────────────────────────────────────────
export const categories_api = {
  getAll: () => apiClient.get<Category[]>("/categories"),

  create: async (data: {
    name: string;
    position: number;
    imageFile?: string;
  }) => apiClient.post("/categories", data),

  update: async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<Category> & { imageFile?: string };
  }) => apiClient.patch(`/categories/${id}`, data),

  delete: async (id: string) => apiClient.delete(`/categories/${id}`),

  reorder: async (categories: { id: string; position: number }[]) =>
    apiClient.patch(`/categories/reorder`, { categories }),
};
