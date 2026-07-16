"use client";

import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { ModifierGroupUI } from "@/types/products";
import React, { useState } from "react";

// Props
interface GroupReorderPanelProps {
  /** Current modifier groups - used to display names and detect add/remove  */
  groups: ModifierGroupUI[];

  //** Called when the admin reoders groups via drag-and-drop*/
  onOrderChange: (newOrder: number[]) => void;
}

/**
 * Compact right-column panel that shows modifier groups as draggable capsules.
 * The admin drags these to reodr  groups without scrolling through large cards
 * Reports the new order (array of original indices) to the parent on each drop
 * @returns
 */

const GroupReorderPanel = ({
  groups,
  onOrderChange,
}: GroupReorderPanelProps) => {
  // internal display order - array of original indices in the current visual order.
  const [displayOrder, setDisplayOrder] = useState<number[]>(() =>
    groups.map((_, i) => i),
  );

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  /** If group count changed (add/remove), fall back to defauly order */
  // This avoids effects/refs - just derives the correct order during render.

  const effectiveDisplayOrder =
    displayOrder.length === groups.length
      ? displayOrder
      : groups.map((_, i) => i);

  /** Handle dropping a capsule onto a target position */
  const handleDrop = (targeIndex: number) => {
    if (dragIndex === null || dragIndex === targeIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Compute the new roder outside of any state updater to avoid
    // calling parent setState while this componetn is mid-render.
    const next = [...effectiveDisplayOrder];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targeIndex, 0, moved);

    setDisplayOrder(next);
    onOrderChange(next);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Don't render if fewer than 2 groups (nothing to reorder)
  if (groups.length < 2) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/** Header - matches ProductSectionCard Style */}
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/70">
        <span className="text-brand-color-500">
          <DynamicIcon name="ArrowUpDown" size={15} />
        </span>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Group Order
        </h2>
      </div>

      <div className="p-4 space-y-2">
        <p className="text-[11px] text-gray-400 leading-relaxed px-1">
          Drag to reorder how groups appear to customers
        </p>

        {effectiveDisplayOrder.map((originalIdx, displayIdx) => {
          const group = groups[originalIdx];
          if (!group) return null;

          const isDragging = dragIndex === displayIdx;
          const isDragOver = dragOverIndex === displayIdx;
          const name = group.name || `Group ${displayIdx + 1}`;

          return (
            <div
              key={`reorder-${originalIdx}`}
              draggable
              onDragStart={() => {
                setDragIndex(displayIdx);
                setDragOverIndex(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(displayIdx);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(displayIdx);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${isDragging ? "opacity-40 scale-95" : ""} ${isDragOver && !isDragging ? "border-brand-color-500 bg-brand-color-500/5 shadow-sm" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}
            >
              {/** Drag grip */}
              <DynamicIcon
                name="GripVertical"
                size={14}
                className="text-gray-400 shrink-0"
              />

              {/* Position number */}
              <span className="text-[11px] font-mono text-gray-400 w-4 text-center shrink-0">
                {displayIdx + 1}
              </span>

              {/* Group name */}
              <span className="text-sm font-medium text-gray-700 truncate min-w-0">
                {name}
              </span>

              {/* Item count badge */}
              <span className="ml-auto text-[10px] text-gray-400 bg-gray-200/60 px-1.5 py-0.5 rounded-full shrink-0">
                {group.items.length}{" "}
                {group.items.length === 1 ? "item" : "items"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupReorderPanel;
