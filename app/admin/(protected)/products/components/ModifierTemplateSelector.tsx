"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { ModifierGroupTemplate } from "@/types/products";
import { InputField } from "@/components/ui/FormComponents";
import { IconButton } from "@/components/ui/buttons";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModifierTemplateSelectorProps {
  onClose: () => void;
  onSelect: (template: ModifierGroupTemplate) => void;
  templates: ModifierGroupTemplate[];
  loading: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Modal for selecting a reusable modifier group template to apply to a product.
 * Shows all available templates with their names, settings, and item count.
 */
const ModifierTemplateSelector = ({
  onClose,
  onSelect,
  templates,
  loading,
}: ModifierTemplateSelectorProps) => {
  const [search, setSearch] = useState("");

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal
      onClose={onClose}
      title="Apply Modifier Template"
      subTitle="Select a reusable modifier group to apply to this product"
      contentClassName="!p-0"
    >
      {/* Search */}
      <div className="sticky top-18 bg-white px-6 py-3 border-b border-slate-100 z-30">
        <InputField
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={
            <DynamicIcon
              name="Search"
              size={16}
              className="text-gray-400 shrink-0"
            />
          }
          rightElement={
            search && (
              <IconButton
                type="button"
                onClick={() => setSearch("")}
                icon={{ name: "X" }}
                variant="ghost"
              />
            )
          }
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
          <DynamicIcon name="LoaderCircle" size={24} className="animate-spin" />
          <p className="text-sm">Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
          <DynamicIcon name="Layers" size={28} />
          <p className="text-sm">
            {search
              ? "No templates match your search"
              : "No modifier templates available"}
          </p>
          <p className="text-xs text-gray-300">
            Create templates in the Modifier Groups page first
          </p>
        </div>
      ) : (
        <div className="px-6 py-4 space-y-2 max-h-[55vh] overflow-y-auto">
          {filteredTemplates.map((template) => (
            <button
              key={template._id}
              type="button"
              onClick={() => onSelect(template)}
              className="w-full flex items-start gap-4 px-4 py-3 border border-gray-200 rounded-lg hover:bg-brand-color-500/5 hover:border-brand-color-500/30 transition cursor-pointer text-left"
            >
              <DynamicIcon
                name="Layers"
                size={18}
                className="text-gray-400 mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {template.name}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                  <span>
                    {template.items.length} item
                    {template.items.length !== 1 ? "s" : ""}
                  </span>
                  <span
                    className={
                      template.required ? "text-green-600" : "text-gray-400"
                    }
                  >
                    {template.required ? "Required" : "Optional"}
                  </span>
                  <span>
                    Min {template.minSelect} / Max {template.maxSelect}
                  </span>
                </div>
                {/* Show item names preview */}
                {template.items.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.items.slice(0, 5).map((item, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded"
                      >
                        {item.product && typeof item.product === "object"
                          ? item.product.name
                          : item.snapshotName || item.label || `Item ${i + 1}`}
                      </span>
                    ))}
                    {template.items.length > 5 && (
                      <span className="text-[10px] text-gray-400">
                        +{template.items.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end z-30">
        <IconButton
          onClick={onClose}
          variant="secondary"
          text="Cancel"
          className="px-4"
        />
      </div>
    </Modal>
  );
};

export default ModifierTemplateSelector;
