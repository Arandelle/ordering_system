"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Pencil, Trash2, Plus, X, Check, Loader2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Category {
  _id: string;
  name: string;
  position: number;
}

// ── API helpers ───────────────────────────────────────────────────────────────
const api = {
  getAll: async (): Promise<Category[]> => {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  },
  create: async (data: { name: string; position: number }) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return res.json();
  },
  update: async ({ id, data }: { id: string; data: Partial<Category> }) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update category");
    return res.json();
  },
  delete: async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete category");
    return res.json();
  },
  reorder: async (categories: { id: string; position: number }[]) => {
    const res = await fetch("/api/categories/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories }),
    });
    if (!res.ok) throw new Error("Failed to reorder categories");
    return res.json();
  },
};

// ── Inline edit row ───────────────────────────────────────────────────────────
const EditRow = ({
  category,
  onSave,
  onCancel,
  isSaving,
}: {
  category: Category;
  onSave: (name: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}) => {
  const [value, setValue] = useState(category.name);

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-brand-color-50 border border-brand-color-200">
      <GripVertical className="text-gray-300 shrink-0" size={18} />
      <span className="text-xs font-mono text-gray-400 w-6">{category.position}</span>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(value);
          if (e.key === "Escape") onCancel();
        }}
        className="flex-1 bg-white border border-brand-color-300 px-3 py-1.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-color-500"
      />
      <button
        onClick={() => onSave(value)}
        disabled={isSaving || !value.trim()}
        className="p-1.5 bg-brand-color-500 text-white hover:bg-brand-color-600 disabled:opacity-50 transition-colors"
      >
        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
      </button>
      <button
        onClick={onCancel}
        className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// ── Category row ──────────────────────────────────────────────────────────────
const CategoryRow = ({
  category,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDragOver,
  isDeleting,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  isDragging: boolean;
  isDragOver: boolean;
  isDeleting: boolean;
}) => (
  <div
    draggable
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDrop={onDrop}
    className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white group transition-all duration-150
      ${isDragging ? "opacity-40" : "opacity-100"}
      ${isDragOver ? "border-t-2 border-t-brand-color-500" : ""}
    `}
  >
    <GripVertical
      className="text-gray-300 group-hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0 transition-colors"
      size={18}
    />
    <span className="text-xs font-mono text-gray-300 w-6">{category.position}</span>
    <span className="flex-1 text-sm font-medium text-gray-800">{category.name}</span>
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={onEdit}
        className="p-1.5 text-gray-400 hover:text-brand-color-500 hover:bg-brand-color-50 transition-colors"
        aria-label="Edit"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        aria-label="Delete"
      >
        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const Page = () => {
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Queries ──
  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: api.getAll,
    select: (data) => [...data].sort((a, b) => a.position - b.position),
  });

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsAdding(false);
      setNewName("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: api.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.delete,
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const reorderMutation = useMutation({
    mutationFn: api.reorder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  // ── Drag & drop ──
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;

    const sorted = [...categories];
    const fromIdx = sorted.findIndex((c) => c._id === dragId);
    const toIdx = sorted.findIndex((c) => c._id === targetId);

    const reordered = [...sorted];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    const updates = reordered.map((c, i) => ({ id: c._id, position: i + 1 }));

    // Optimistic update
    queryClient.setQueryData(["categories"], () =>
      reordered.map((c, i) => ({ ...c, position: i + 1 }))
    );

    reorderMutation.mutate(updates);
    setDragId(null);
    setDragOverId(null);
  };

  // ── Handlers ──
  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate({
      name: newName.trim(),
      position: categories.length + 1,
    });
  };

  const handleUpdate = (id: string, name: string) => {
    if (!name.trim()) return;
    updateMutation.mutate({ id, data: { name: name.trim() } });
  };

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-brand-color-500 font-bold tracking-[0.2em] uppercase text-xs mb-1">
            Admin
          </p>
          <h1 className="text-3xl font-black text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Drag rows to reorder. Changes save automatically.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 shadow-sm">

          {/* Table header */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-gray-50">
            <span className="w-[18px]" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest w-6">#</span>
            <span className="flex-1 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</span>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Loading categories...</span>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-semibold text-red-500 mb-1">Failed to load categories</p>
              <p className="text-xs text-gray-400">Check your connection and refresh.</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && categories.length === 0 && !isAdding && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-gray-400">No categories yet.</p>
              <p className="text-xs text-gray-300 mt-1">Click "Add Category" to get started.</p>
            </div>
          )}

          {/* Rows */}
          {!isLoading && !isError && categories.map((category) =>
            editingId === category._id ? (
              <EditRow
                key={category._id}
                category={category}
                onSave={(name) => handleUpdate(category._id, name)}
                onCancel={() => setEditingId(null)}
                isSaving={updateMutation.isPending}
              />
            ) : (
              <CategoryRow
                key={category._id}
                category={category}
                onEdit={() => setEditingId(category._id)}
                onDelete={() => deleteMutation.mutate(category._id)}
                onDragStart={() => setDragId(category._id)}
                onDragOver={(e) => { e.preventDefault(); setDragOverId(category._id); }}
                onDrop={() => handleDrop(category._id)}
                isDragging={dragId === category._id}
                isDragOver={dragOverId === category._id}
                isDeleting={deletingId === category._id}
              />
            )
          )}

          {/* Add new row */}
          {isAdding && (
            <div className="flex items-center gap-3 px-4 py-3 bg-brand-color-50 border-t border-brand-color-200">
              <GripVertical className="text-gray-200 shrink-0" size={18} />
              <span className="text-xs font-mono text-gray-300 w-6">
                {categories.length + 1}
              </span>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") { setIsAdding(false); setNewName(""); }
                }}
                placeholder="Category name..."
                className="flex-1 bg-white border border-brand-color-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-brand-color-500"
              />
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || !newName.trim()}
                className="p-1.5 bg-brand-color-500 text-white hover:bg-brand-color-600 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Check size={14} />
                }
              </button>
              <button
                onClick={() => { setIsAdding(false); setNewName(""); }}
                className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Footer / Add button */}
          {!isAdding && (
            <div className="px-4 py-3 border-t border-gray-100">
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 text-sm font-bold text-brand-color-500 hover:text-brand-color-600 transition-colors"
              >
                <Plus size={16} />
                Add Category
              </button>
            </div>
          )}
        </div>

        {/* Reorder hint */}
        {categories.length > 1 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            {reorderMutation.isPending ? "Saving order..." : "Drag ⠿ to reorder"}
          </p>
        )}

      </div>
    </div>
  );
};

export default Page;