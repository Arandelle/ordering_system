"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { AppImage } from "@/components/AppImage";
import { InputField, ToggleButton } from "@/components/ui/FormComponents";
import ProductSelectionModal from "../../products/ProductSelectionModal";
import {
  ModifierGroupTemplate,
  ModifierGroupTemplateItem,
  Product,
} from "@/types/products";
import { IconButton } from "@/components/ui/buttons";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TemplateFormPayload {
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  maxQty: number;
  items: ModifierGroupTemplateItem[];
}

interface ModifierGroupTemplateFormProps {
  template?: ModifierGroupTemplate | null;
  onSave: (payload: TemplateFormPayload) => void;
  onCancel: () => void;
  isSaving: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Reusable form for creating and editing modifier group templates.
 * Manages its own local state for fields, items, and drag-and-drop reorder.
 * Calls `onSave` with validated payload on submit; `onCancel` to go back.
 */
export default function ModifierGroupTemplateForm({
  template,
  onSave,
  onCancel,
  isSaving,
}: ModifierGroupTemplateFormProps) {
  const isEdit = !!template;
  const productCount = template?.productCount ?? 0;

  const [name, setName] = useState(template?.name ?? "");
  const [required, setRequired] = useState(template?.required ?? true);
  // Stored as string | number so the input can be fully cleared without producing NaN
  const [minSelect, setMinSelect] = useState<number | string>(
    template?.minSelect ?? 1,
  );
  const [maxSelect, setMaxSelect] = useState<number | string>(
    template?.maxSelect ?? 1,
  );
  const [maxQty, setMaxQty] = useState<number | string>(template?.maxQty ?? 1);
  const [items, setItems] = useState<ModifierGroupTemplateItem[]>(
    (template?.items ?? []).map((item, idx) => ({
      ...item,
      position: idx + 1,
    })),
  );

  // ── Drag-and-drop state for item reorder ────────────────────────────────────

  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(
    null,
  );

  const handleItemDrop = (targetIndex: number) => {
    if (dragItemIndex === null || dragItemIndex === targetIndex) return;
    setItems((prev) => {
      const reordered = [...prev];
      const [moved] = reordered.splice(dragItemIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      return reordered.map((item, i) => ({ ...item, position: i + 1 }));
    });
    setDragItemIndex(null);
    setDragOverItemIndex(null);
  };

  // ── Product selection modal ─────────────────────────────────────────────────

  const [showProductModal, setShowProductModal] = useState(false);

  const handleProductConfirm = (selectedProducts: Product[]) => {
    const existingIds = items.map((i) =>
      typeof i.product === "string" ? i.product : (i.product?._id ?? ""),
    );
    const newItems: ModifierGroupTemplateItem[] = selectedProducts
      .filter((p) => !existingIds.includes(p._id))
      .map((p, idx) => ({
        product: p._id,
        label: null,
        price: p.price ?? null,
        snapshotName: p.name,
        snapshotPrice: p.price ?? null,
        position: items.length + idx + 1,
      }));
    setItems([...items, ...newItems]);
    setShowProductModal(false);
  };

  const removeItem = (index: number) => {
    setItems(
      items
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, position: i + 1 })),
    );
  };

  const updateItem = (
    index: number,
    field: string,
    value: string | number | null,
  ) => {
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (items.length === 0) {
      toast.error("Template must have at least one item");
      return;
    }
    if (minSelect === "" || maxSelect === "" || maxQty === "") {
      toast.error("Minimum, Maximum, and Max quantity are required");
      return;
    }

    const parsedMin =
      typeof minSelect === "number" && minSelect >= 1 ? minSelect : 1;
    const parsedMax =
      typeof maxSelect === "number" && maxSelect >= 1 ? maxSelect : parsedMin;
    const parsedMaxQty =
      typeof maxQty === "number" && maxQty >= 1
        ? maxQty
        : Math.max(parsedMin, parsedMax);

    onSave({
      name: name.trim(),
      required,
      minSelect: parsedMin,
      maxSelect: parsedMax,
      maxQty: parsedMaxQty,
      items: items.map((item, idx) => ({
        product:
          typeof item.product === "string"
            ? item.product
            : (item.product?._id ?? ""),
        label: item.label ?? null,
        price: item.price ?? null,
        snapshotName: item.snapshotName ?? null,
        snapshotPrice: item.snapshotPrice ?? null,
        position: item.position ?? idx + 1,
      })),
    });
  };

  const alreadySelectedIds = items.map((i) =>
    typeof i.product === "string" ? i.product : (i.product?._id ?? ""),
  );

  const isSubmitDisabled =
    isSaving ||
    !name.trim() ||
    items.length === 0 ||
    minSelect === "" ||
    maxSelect === "" ||
    maxQty === "";

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
      {/* Warning banner when editing a template that products reference */}
      {isEdit && productCount > 0 && (
        <div className="flex items-start gap-3 px-6 py-3 bg-amber-50 border-b border-amber-200">
          <DynamicIcon
            name="AlertTriangle"
            size={18}
            className="text-amber-500 shrink-0 mt-0.5"
          />
          <div className="text-xs text-amber-700">
            <p className="font-semibold">
              {productCount} product{productCount !== 1 ? "s" : ""}{" "}
              {productCount !== 1 ? "use" : "uses"} this template
            </p>
            <p className="mt-1 text-amber-600">
              After saving, you&apos;ll be prompted to sync the updated template
              to all linked products at once. If you skip, products will keep
              their current data and can be synced individually later.
            </p>
          </div>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* Name */}
        <InputField
          label="Template Name"
          type="text"
          placeholder="e.g., Grilled Items, Drinks, Appetizer"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="self-center">
            <ToggleButton
              label="Required"
              checked={required}
              onCheckedChange={setRequired}
            />
          </div>
          <InputField
            label="Minimum to select"
            type="number"
            min={1}
            max={items.length || 1}
            placeholder="Required"
            required
            value={minSelect}
            onChange={(e) => {
              const raw = e.target.value;
              setMinSelect(raw === "" ? "" : parseInt(raw, 10));
            }}
          />
          <InputField
            label="Maximum to select"
            type="number"
            min={typeof minSelect === "number" ? minSelect : 1}
            max={items.length || 1}
            placeholder="Required"
            required
            value={maxSelect}
            onChange={(e) => {
              const raw = e.target.value;
              setMaxSelect(raw === "" ? "" : parseInt(raw, 10));
            }}
          />
          <InputField
            label="Max quantity"
            type="number"
            min={Math.max(
              typeof minSelect === "number" ? minSelect : 1,
              typeof maxSelect === "number" ? maxSelect : 1,
            )}
            max={99}
            placeholder="Required"
            required
            value={maxQty}
            onChange={(e) => {
              const raw = e.target.value;
              setMaxQty(raw === "" ? "" : parseInt(raw, 10));
            }}
          />
        </div>

        {/* Select products button */}
        <IconButton
          type="button"
          onClick={() => setShowProductModal(true)}
          text="Select Products"
          variant="ghost"
          className="text-brand-color-500 hover:bg-transparent hover:text-brand-color-600 px-0"
          icon={{ name: "Search" }}
        />

        {/* Items list */}
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item, i) => {
              const displayName =
                item.snapshotName ||
                item.label ||
                (typeof item.product === "object"
                  ? item.product?.name
                  : `Item ${i + 1}`);
              const soloPrice = item.snapshotPrice ?? null;
              const itemImageUrl =
                typeof item.product === "object" && item.product?.image?.url
                  ? item.product.image.url
                  : "";
              const isDraggingItem = dragItemIndex === i;
              const isDragOverItem = dragOverItemIndex === i;

              return (
                <div
                  key={i}
                  draggable
                  onDragStart={() => {
                    setDragItemIndex(i);
                    setDragOverItemIndex(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverItemIndex(i);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleItemDrop(i);
                  }}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg relative transition-all duration-150 select-none
                    ${isDraggingItem ? "opacity-40" : ""}
                    ${isDragOverItem ? "border-t-2 border-t-brand-color-500" : ""}`}
                >
                  {/* Drag handle + position */}
                  <div className="flex items-center gap-2 shrink-0">
                    <DynamicIcon
                      name="GripVertical"
                      className="text-gray-400 cursor-grab active:cursor-grabbing"
                      size={16}
                    />
                    <span className="text-xs font-mono text-gray-500">
                      {item.position ?? i + 1}
                    </span>
                  </div>
                  {/* Product image + name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-md shrink-0 border border-gray-200 overflow-hidden">
                      <AppImage src={itemImageUrl} alt={displayName} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 min-w-0 truncate">
                      {displayName}
                    </p>
                  </div>

                  {/* Label + Price overrides */}
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <InputField
                      label="Label"
                      type="text"
                      placeholder="Display name"
                      value={item.label || ""}
                      onChange={(e) =>
                        updateItem(i, "label", e.target.value || null)
                      }
                    />
                    <InputField
                      label="Upgrade ₱"
                      type="number"
                      min={0}
                      step="1"
                      placeholder={soloPrice?.toString() ?? "0"}
                      value={item.price ?? ""}
                      onChange={(e) =>
                        updateItem(
                          i,
                          "price",
                          e.target.value ? parseFloat(e.target.value) : null,
                        )
                      }
                    />

                    <IconButton
                      type="button"
                      onClick={() => removeItem(i)}
                      className="rounded-full  place-self-start"
                      variant="secondary"
                      icon={{ name: "Trash2", size: 12 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            No items yet. Click &quot;Select Products&quot; to add items to this
            template.
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <IconButton
            onClick={onCancel}
            variant="outline"
            text="Cancel"
            className="px-4 rounded-lg"
          />
          <IconButton
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            variant={isSaving ? "disabled" : isEdit ? "success" : "primary"}
            text={
              isSaving
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Template"
                  : "Create Template"
            }
            className="px-4 rounded-lg"
          />
        </div>
      </div>

      {/* Product selection modal */}
      {showProductModal && (
        <ProductSelectionModal
          onClose={() => setShowProductModal(false)}
          onConfirm={handleProductConfirm}
          alreadySelectedIds={alreadySelectedIds}
        />
      )}
    </div>
  );
}
