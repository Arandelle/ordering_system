"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ModifierGroupTemplateForm, {
  TemplateFormPayload,
} from "../components/ModifierGroupTemplateForm";
import { apiClient } from "@/lib/apiClient";
import { ModifierGroupTemplate } from "@/types/products";

export default function CreateModifierGroupTemplatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (payload: TemplateFormPayload) => {
      const response = await apiClient.post<{
        data: ModifierGroupTemplate;
      }>("/modifier-group-templates", payload);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["modifier-group-templates"],
      });
      toast.success("Template created!");
      router.push("/modifier-groups");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create template"),
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="mb-0 text-xl font-bold text-gray-800 md:mb-2 md:text-2xl lg:text-3xl">
          Create Modifier Template
        </h1>
        <p className="text-sm text-gray-500 lg:text-lg">
          Define a reusable modifier group that can be applied to multiple
          combo/set products
        </p>
      </div>
      <ModifierGroupTemplateForm
        onSave={(payload) => createMutation.mutate(payload)}
        onCancel={() => router.push("/modifier-groups")}
        isSaving={createMutation.isPending}
      />
    </section>
  );
}
