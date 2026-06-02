"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import SectionHeader from "@/app/admin/components/SectionHeader";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import PermissionGuard from "@/lib/PermissionGuard";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import { useStaffContext } from "@/contexts/StaffContext";
import { Category, SubCategory } from "@/types/category";
import {
  categories_api,
  subcategories_api,
} from "../categories/hooks/api";

type SubCategoryCategory = SubCategory["category"] | null | undefined;
type ApiClientError = { message?: string };

const getCategoryId = (category: SubCategoryCategory) => {
  if (!category) return null;
  return typeof category === "string" ? category : category._id;
};

const getCategoryName = (category: SubCategoryCategory) =>
  !category
    ? "Missing category"
    : typeof category === "string"
      ? "Category details unavailable"
      : category.name;

const SubEditRow = ({
  subcategory,
  categories,
  onSave,
  onCancel,
  isSaving,
}: {
  subcategory: SubCategory;
  categories: Category[];
  onSave: (name: string, categoryId: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}) => {
  const [value, setValue] = useState(subcategory.name);
  const [categoryId, setCategoryId] = useState(
    getCategoryId(subcategory.category) ?? "",
  );

  return (
    <div className="grid grid-cols-[1fr_2fr_2fr_2fr] items-center gap-6 px-6 py-3 bg-brand-color-50 border border-brand-color-200">
      <span className="text-xs font-mono text-gray-500 text-center">
        {subcategory.position}
      </span>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(value, categoryId);
          if (e.key === "Escape") onCancel();
        }}
        className="bg-white border border-brand-color-300 px-3 py-1.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-color-500"
      />
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="bg-white border border-brand-color-300 px-3 py-1.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-color-500"
      >
        <option value="">Select category</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
      <div className="flex justify-center items-center gap-1">
        <button
          onClick={() => onSave(value, categoryId)}
          disabled={isSaving || !value.trim() || !categoryId}
          className="p-1.5 bg-brand-color-500 text-white hover:bg-brand-color-600 disabled:opacity-50 transition-colors"
          aria-label="Save subcategory"
        >
          {isSaving ? (
            <DynamicIcon name="Loader2" size={14} className="animate-spin" />
          ) : (
            <DynamicIcon name="Check" size={14} />
          )}
        </button>
        <button
          onClick={onCancel}
          className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          aria-label="Cancel edit"
        >
          <DynamicIcon name="X" size={14} />
        </button>
      </div>
    </div>
  );
};

const SubCategoryRow = ({
  subcategory,
  onEdit,
  onDelete,
  isDeleting,
}: {
  subcategory: SubCategory;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) => {
  const categoryId = getCategoryId(subcategory.category);

  return (
    <div className="grid grid-cols-[1fr_2fr_2fr_2fr] items-center gap-6 px-6 py-3 border-b border-gray-100 bg-white group transition-colors hover:bg-gray-50">
      <span className="text-xs font-mono text-gray-500 text-center">
        {subcategory.position}
      </span>
      <span className="text-sm font-medium text-gray-800">
        {subcategory.name}
      </span>
      <div className="min-w-0">
        {categoryId ? (
          <Link
            href={`/categories/${categoryId}/subcategories`}
            className="inline-flex max-w-full items-center gap-1.5 px-2 py-0.5 bg-brand-color-50 text-brand-color-600 text-xs font-semibold rounded-full border border-brand-color-100 hover:bg-brand-color-100 transition-colors"
          >
            <DynamicIcon name="Folder" size={11} className="shrink-0" />
            <span className="truncate">
              {getCategoryName(subcategory.category)}
            </span>
          </Link>
        ) : (
          <span className="inline-flex max-w-full items-center gap-1.5 px-2 py-0.5 bg-gray-50 text-gray-500 text-xs font-semibold rounded-full border border-gray-100">
            <DynamicIcon name="FolderX" size={11} className="shrink-0" />
            <span className="truncate">Missing category</span>
          </span>
        )}
      </div>
      <div className="flex justify-center items-center gap-1">
        {categoryId && (
          <Link
            href={`/categories/${categoryId}/subcategories`}
            className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            aria-label="Manage category subcategories"
          >
            <DynamicIcon name="ExternalLink" size={14} />
          </Link>
        )}
        <PermissionGuard
          permission="categories.update"
          fallback={<span className="text-xs text-gray-400">No access</span>}
        >
          <button
            onClick={onEdit}
            disabled={isDeleting}
            className="p-1.5 text-dark-green-500 hover:text-dark-green-600 hover:bg-dark-green-50 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Edit subcategory"
          >
            <DynamicIcon name="Pencil" size={14} />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Delete subcategory"
          >
            {isDeleting ? (
              <DynamicIcon name="Loader2" size={14} className="animate-spin" />
            ) : (
              <DynamicIcon name="Trash2" size={14} />
            )}
          </button>
        </PermissionGuard>
      </div>
    </div>
  );
};

const Page = () => {
  const queryClient = useQueryClient();
  const admin = useStaffContext();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: categories_api.getAll,
    select: (data) => [...data].sort((a, b) => a.position - b.position),
  });

  const {
    data: subcategories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subcategories"],
    queryFn: subcategories_api.getAll,
    select: (data) =>
      [...data].sort((a, b) => {
        const categoryCompare = getCategoryName(a.category).localeCompare(
          getCategoryName(b.category),
        );

        return categoryCompare || a.position - b.position;
      }),
  });

  const createMutation = useMutation({
    mutationFn: subcategories_api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsAdding(false);
      setNewName("");
      setNewCategoryId("");
      toast.success("Subcategory created!");
    },
    onError: () => toast.error("Failed to create subcategory"),
  });

  const updateMutation = useMutation({
    mutationFn: subcategories_api.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      setEditingId(null);
      toast.success("Subcategory updated!");
    },
    onError: (error: ApiClientError) =>
      toast.error(error.message || "Failed to update subcategory"),
  });

  const deleteMutation = useMutation({
    mutationFn: subcategories_api.delete,
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Subcategory deleted!");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete subcategory"),
  });

  const handleCreate = () => {
    if (!newName.trim() || !newCategoryId) return;
    createMutation.mutate({
      name: newName.trim(),
      categoryId: newCategoryId,
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Product Subcategories"
        subTitle="View and manage all subcategories across product categories."
        btnTxt={
          !isAdding && canAccess(admin?.role, "categories.create")
            ? "+ Add Subcategory"
            : ""
        }
        onClick={() => setIsAdding(true)}
      />

      <div className="flex items-center justify-center w-full">
        <div className="bg-white border border-gray-200 shadow-sm w-full max-w-400">
          <div className="grid grid-cols-[1fr_2fr_2fr_2fr] items-center gap-6 px-6 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
              #
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-start">
              Name
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-start">
              Category
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
              Actions
            </span>
          </div>

          {(isLoading || isLoadingCategories) && (
            <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
              <DynamicIcon name="Loader2" size={18} className="animate-spin" />
              <span className="text-sm">Loading subcategories...</span>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-semibold text-red-500 mb-1">
                Failed to load subcategories
              </p>
              <p className="text-xs text-gray-500">
                Something went wrong. Please try again.
              </p>
            </div>
          )}

          {!isLoading &&
            !isLoadingCategories &&
            !isError &&
            subcategories.length === 0 &&
            !isAdding && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DynamicIcon
                  name="Layers"
                  size={32}
                  className="text-gray-200 mb-3"
                />
                <p className="text-sm text-gray-500">No subcategories yet.</p>
                <p className="text-xs text-gray-300 mt-1">
                  Add a subcategory to get started.
                </p>
              </div>
            )}

          {isAdding && (
            <div className="grid grid-cols-[1fr_2fr_2fr_2fr] items-center gap-6 px-6 py-3 bg-brand-color-50 border-t border-brand-color-200">
              <span className="text-xs font-mono text-gray-300 text-center">
                New
              </span>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setIsAdding(false);
                    setNewName("");
                    setNewCategoryId("");
                  }
                }}
                placeholder="Subcategory name..."
                className="bg-white border border-brand-color-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-brand-color-500"
              />
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="bg-white border border-brand-color-300 px-3 py-1.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-color-500"
              >
                <option value="">Select category</option>
                {categories.map((category: Category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-center items-center gap-1">
                <button
                  onClick={handleCreate}
                  disabled={
                    createMutation.isPending ||
                    !newName.trim() ||
                    !newCategoryId
                  }
                  className="p-1.5 bg-brand-color-500 text-white hover:bg-brand-color-600 disabled:opacity-50 transition-colors"
                  aria-label="Create subcategory"
                >
                  {createMutation.isPending ? (
                    <DynamicIcon
                      name="Loader2"
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <DynamicIcon name="Check" size={14} />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewName("");
                    setNewCategoryId("");
                  }}
                  className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Cancel create"
                >
                  <DynamicIcon name="X" size={14} />
                </button>
              </div>
            </div>
          )}

          {!isLoading &&
            !isLoadingCategories &&
            !isError &&
            subcategories.map((subcategory) =>
              editingId === subcategory._id ? (
                <SubEditRow
                  key={subcategory._id}
                  subcategory={subcategory}
                  categories={categories}
                  onSave={(name, categoryId) =>
                    updateMutation.mutate({
                      id: subcategory._id,
                      data: { name, categoryId },
                    })
                  }
                  onCancel={() => setEditingId(null)}
                  isSaving={updateMutation.isPending}
                />
              ) : (
                <SubCategoryRow
                  key={subcategory._id}
                  subcategory={subcategory}
                  onEdit={() => setEditingId(subcategory._id)}
                  onDelete={() => deleteMutation.mutate(subcategory._id)}
                  isDeleting={deletingId === subcategory._id}
                />
              ),
            )}
        </div>
      </div>

      {subcategories.length > 0 && (
        <p className="text-xs text-gray-500 text-center mt-4">
          Reorder subcategories inside each category from the category-specific
          manager.
        </p>
      )}
    </div>
  );
};

export default Page;
