"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ModifierGroupTemplateForm, {
  TemplateFormPayload,
} from "../../components/ModifierGroupTemplateForm";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import Modal from "@/components/ui/Modal";
import { IconButton } from "@/components/ui/buttons";
import { apiClient } from "@/lib/apiClient";
import { ModifierGroupTemplate } from "@/types/products";

interface EditModifierGroupTemplateClientProps {
  template: ModifierGroupTemplate;
}

export default function EditModifierGroupTemplateClient({
  template,
}: EditModifierGroupTemplateClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [propagateTarget, setPropagateTarget] =
    useState<ModifierGroupTemplate | null>(null);

  const updateMutation = useMutation({
    mutationFn: async (payload: TemplateFormPayload) => {
      const response = await apiClient.put<{
        data: ModifierGroupTemplate;
      }>(`/modifier-group-templates/${template._id}`, payload);
      return response?.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: ["modifier-group-templates"],
      });

      if (updated && (updated.productCount ?? 0) > 0) {
        setPropagateTarget(updated);
      } else {
        toast.success("Template updated!");
        router.push("/modifier-groups");
      }
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update template"),
  });

  const propagateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<{
        data: {
          updatedCount: number;
          failedCount: number;
          message: string;
        };
      }>(`/modifier-group-templates/${template._id}/propagate`);
      return response?.data;
    },
    onSuccess: (result) => {
      setPropagateTarget(null);
      if (result.failedCount > 0) {
        toast.warning(
          `Synced ${result.updatedCount} product(s), ${result.failedCount} failed`,
        );
      } else {
        toast.success(`Successfully synced ${result.updatedCount} product(s)`);
      }
      router.push("/modifier-groups");
    },
    onError: (error: Error) => {
      setPropagateTarget(null);
      toast.error(error.message || "Failed to sync products");
      router.push("/modifier-groups");
    },
  });

  return (
    <>
      <ModifierGroupTemplateForm
        template={template}
        onSave={(payload) => updateMutation.mutate(payload)}
        onCancel={() => router.push("/modifier-groups")}
        isSaving={updateMutation.isPending}
      />

      {/* Propagate confirmation modal */}
      {propagateTarget && (
        <Modal
          onClose={() => {
            setPropagateTarget(null);
            toast.success("Template updated!");
            router.push("/modifier-groups");
          }}
          title="Sync Template to Products"
          subTitle={`"${propagateTarget.name}" has been updated`}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-500">
                <p className="font-semibold">
                  {propagateTarget.productCount ?? 0} product
                  {(propagateTarget.productCount ?? 0) !== 1 ? "s" : ""}{" "}
                  {(propagateTarget.productCount ?? 0) !== 1
                    ? "reference"
                    : "references"}{" "}
                  this template
                </p>
                <p className="mt-1 text-slate-600">
                  Would you like to apply the updated template to all linked
                  products? This will overwrite their modifier group items, name,
                  and settings with the current template data. Products with
                  local overrides (custom prices or labels) will be replaced.
                </p>
              </div>
            </div>

            {propagateMutation.isPending && (
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600">
                <DynamicIcon
                  name="Loader2"
                  size={16}
                  className="animate-spin"
                />
                Syncing changes to all products...
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <IconButton
                type="button"
                onClick={() => {
                  setPropagateTarget(null);
                  toast.success("Template updated!");
                  router.push("/modifier-groups");
                }}
                disabled={propagateMutation.isPending}
                text="Skip"
                variant="outline"
                className="px-4 rounded-lg"
              />
              <IconButton
                type="button"
                onClick={() => propagateMutation.mutate()}
                disabled={propagateMutation.isPending}
                variant="primary"
                text={
                  propagateMutation.isPending
                    ? "Syncing..."
                    : `Sync All ${propagateTarget.productCount ?? 0} Products`
                }
                className="rounded-lg px-4"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
