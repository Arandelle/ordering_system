"use client";

import { useBranch } from "@/contexts/BranchContext";
import { useBranches } from "@/hooks/api/useBranch";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, Check, Store } from "lucide-react";

function HeaderBranchSelector() {
  const { registerBranchSelectorOpener, selectedBranch, setSelectedBranch } =
    useBranch();
  const { data: branches = [] } = useBranches();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ── Register opener into context so any component can trigger it ──────────
  const openBranchOptions = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => {
      containerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  }, []);

  useEffect(() => {
    registerBranchSelectorOpener(openBranchOptions);
  }, [openBranchOptions, registerBranchSelectorOpener]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Close on Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (branch: (typeof branches)[0]) => {
    // Prevent selecting branches that are not yet ready for orders
    if (branch.openingSoon) return;
    setSelectedBranch(branch);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* ── Trigger ─────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={[
          "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold",
          "transition-all duration-150 outline-none cursor-pointer",
          "focus-visible:ring-2 focus-visible:ring-brand-color-400 focus-visible:ring-offset-1",
          selectedBranch && mounted
            ? "text-brand-color-600 hover:bg-brand-color-50"
            : "text-brand-color-500 hover:bg-brand-color-50",
          isOpen ? "bg-brand-color-50" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <MapPin
          size={15}
          className="shrink-0 text-brand-color-500"
          strokeWidth={2.5}
        />

        <span className="max-w-36 truncate">
          {mounted && selectedBranch ? selectedBranch.name : "Choose a branch"}
        </span>

        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={`shrink-0 text-brand-color-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── Dropdown panel ──────────────────────────────────────────────────── */}
      {isOpen && branches.length > 0 && (
        <div
          role="listbox"
          className={[
            "absolute left-0 top-[calc(100%+8px)] z-50",
            "min-w-70 max-w-85",
            "rounded-2xl border border-brand-color-100 bg-white",
            "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.06),0_10px_30px_-4px_rgba(0,0,0,0.12)]",
            "p-1.5",
          ].join(" ")}
        >
          <p className="px-3 pb-2 pt-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-1">
            Select a branch
          </p>

          {branches.map((branch) => {
            const isSelected = selectedBranch?._id === branch._id;
            const isUnavailable = branch.openingSoon;

            return (
              <button
                key={branch._id}
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-disabled={isUnavailable}
                onClick={() => handleSelect(branch)}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
                  "text-left transition-colors duration-100 outline-none",
                  "focus-visible:ring-2 focus-visible:ring-brand-color-400",
                  isUnavailable ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                  isSelected ? "bg-brand-color-50" : "hover:bg-gray-50",
                ].join(" ")}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isSelected
                      ? "bg-brand-color-100 text-brand-color-600"
                      : isUnavailable
                        ? "bg-gray-100 text-gray-300"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Store size={15} strokeWidth={2} />
                </span>

                <span className="flex min-w-0 flex-col gap-0.5">
                  <span
                    className={`truncate text-sm font-semibold ${
                      isSelected ? "text-brand-color-800" : isUnavailable ? "text-gray-500" : "text-gray-800"
                    }`}
                  >
                    {branch.name}
                  </span>
                  <span className="truncate text-xs text-gray-400">
                    {branch.address}
                  </span>
                </span>

                {isUnavailable ? (
                  <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-600 px-2 py-1 rounded-md">
                    Opening Soon
                  </span>
                ) : isSelected ? (
                  <Check
                    size={15}
                    strokeWidth={2.5}
                    className="ml-auto shrink-0 text-brand-color-500"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HeaderBranchSelector;
