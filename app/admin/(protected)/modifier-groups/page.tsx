"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import SectionHeader from "../../components/SectionHeader";
import Modal from "@/components/ui/Modal";
import { ModifierGroupTemplate } from "@/types/products";
import { apiClient } from "@/lib/apiClient";
import { IconButton } from "@/components/ui/buttons";

// ─── API helpers ──────────────────────────────────────────────────────────────

const templatesApi = {
  getAll: async (): Promise<ModifierGroupTemplate[]> => {
    const response = await apiClient.get<{ data: ModifierGroupTemplate[] }>(
      "/modifier-group-templates",
    );
    return response?.data ?? [];
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/modifier-group-templates/${id}`);
  },
};

// ─── Template List Row ────────────────────────────────────────────────────────

const TemplateRow = ({
  template,
  onEdit,
  onRequestDelete,
  isDeleting,
}: {
  template: ModifierGroupTemplate;
  onEdit: () => void;
  onRequestDelete: () => void;
  isDeleting: boolean;
}) => {
  const itemNames = template.items.map((item) => {
    if (item.product && typeof item.product === "object") {
      return item.product.name;
    }
    return item.snapshotName || item.label || "Unknown";
  });

  return (
    <div
      className="flex items-start gap-4 px-6 py-4 border-b border-gray-100 bg-white hover:bg-gray-50 transition cursor-pointer"
      onClick={onEdit}
    >
      <div className="flex items-center justify-center w-10 h-10 bg-brand-color-50 rounded-lg shrink-0">
        <DynamicIcon name="Layers" size={18} className="text-brand-color-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{template.name}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span>
            {template.items.length} item
            {template.items.length !== 1 ? "s" : ""}
          </span>
          <span
            className={template.required ? "text-green-600" : "text-gray-400"}
          >
            {template.required ? "Required" : "Optional"}
          </span>
          <span>
            Min {template.minSelect} / Max {template.maxSelect}
          </span>
          {(template.productCount ?? 0) > 0 && (
            <span className="text-blue-500">
              {template.productCount} product
              {template.productCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {itemNames.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {itemNames.slice(0, 6).map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded"
              >
                {name}
              </span>
            ))}
            {itemNames.length > 6 && (
              <span className="text-[10px] text-gray-400">
                +{itemNames.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          disabled={isDeleting}
          aria-label="Edit template"
          variant="ghost"
          icon={{ name: "Pencil", className: "text-green-500" }}
          className="hover:bg-green-50"
        />
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete();
          }}
          disabled={isDeleting}
          aria-label="Delete template"
          variant="ghost"
          icon={{
            name: isDeleting ? "Loader2" : "Trash2",
            className: isDeleting ? "animate-spin" : "text-red-500",
          }}
          className="hover:bg-red-50"
        />
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ModifierGroupTemplatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ModifierGroupTemplate | null>(null);

  const {
    data: templates = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["modifier-group-templates"],
    queryFn: templatesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: templatesApi.delete,
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["modifier-group-templates"],
      });
      setDeleteTarget(null);
      toast.success("Template deleted!");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete template"),
  });

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Modifier Group Templates"
        subTitle="Create reusable modifier groups that can be applied to combo/set products"
        btnTxt="+ Create Template"
        onClick={() => router.push("/modifier-groups/new")}
      />

      <div className="flex items-center justify-center w-full">
        <div className="bg-white border border-gray-200 shadow-sm w-full max-w-400">
          {/* Header */}
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {templates.length} template
              {templates.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
              <DynamicIcon name="Loader2" size={18} className="animate-spin" />
              <span className="text-sm">Loading templates...</span>
            </div>
          )}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-semibold text-red-500 mb-1">
                Failed to load templates
              </p>
              <p className="text-xs text-gray-500">Something went wrong.</p>
            </div>
          )}
          {!isLoading && !isError && templates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DynamicIcon
                name="Layers"
                size={32}
                className="text-gray-200 mb-3"
              />
              <p className="text-sm text-gray-500">No templates yet.</p>
              <p className="text-xs text-gray-300 mt-1">
                Create a template to quickly apply modifier groups to products.
              </p>
            </div>
          )}
          {!isLoading &&
            !isError &&
            templates.map((template) => (
              <TemplateRow
                key={template._id}
                template={template}
                onEdit={() =>
                  router.push(`/modifier-groups/${template._id}/edit`)
                }
                onRequestDelete={() => setDeleteTarget(template)}
                isDeleting={deletingId === template._id}
              />
            ))}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <Modal
          onClose={() => setDeleteTarget(null)}
          title="Delete Template"
          subTitle={`Are you sure you want to delete "${deleteTarget.name}"?`}
        >
          <div className="space-y-4">
            {(deleteTarget.productCount ?? 0) > 0 ? (
              <div className="flex items-start gap-3">
                <div className="text-red-500">
                  <p className="font-semibold">
                    {deleteTarget.productCount} product
                    {deleteTarget.productCount !== 1 ? "s" : ""}{" "}
                    {deleteTarget.productCount !== 1
                      ? "reference"
                      : "references"}{" "}
                    this template
                  </p>
                  <p className="mt-1 text-slate-600">
                    Those products will keep their embedded modifier group data,
                    but the template link becomes stale. &quot;Sync from
                    template&quot; will no longer work for those products.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">
                No products currently use this template. It can be safely
                deleted.
              </p>
            )}
            <div className="flex items-center justify-end gap-3 pt-4">
              <IconButton
                type="button"
                onClick={() => setDeleteTarget(null)}
                text="Cancel"
                variant="outline"
                className="px-4 rounded-lg"
              />
              <IconButton
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget._id)}
                disabled={deleteMutation.isPending}
                variant="primary"
                text={
                  deleteMutation.isPending ? "Deleting..." : "Delete Template"
                }
                className="px-4 rounded-lg"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
