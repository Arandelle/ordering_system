// BranchSelector.tsx
"use client";

import { DynamicIcon } from "@/lib/DynamicIcon";
import { MODAL_TYPES, ModalType } from "@/hooks/utils/useModalQuery";
import { Branch } from "@/types/branch";

type BranchSelectorProps = {
  selectedBranch?: Branch | null;
  openModal: (value: ModalType) => void;
};

const BranchSelector = ({ selectedBranch, openModal }: BranchSelectorProps) => {
  if (selectedBranch) {
    return (
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 px-3.5 py-3">
        <DynamicIcon
          name="MapPin"
          size={14}
          className="text-brand-color-500 mt-0.5 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-xs font-medium text-brand-color-900 truncate">
            {selectedBranch.name}
          </p>
          {selectedBranch.address && (
            <p className="text-xs text-brand-color-600 mt-0.5 leading-snug">
              {selectedBranch.address}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-100 px-3.5 py-3">
      <div className="flex items-center gap-2">
        <DynamicIcon name="MapPin" size={14} className="text-red-400 shrink-0" />
        <p className="text-sm text-red-500 font-medium">No branch selected</p>
      </div>
      <button
        className="text-sm underline text-red-500 hover:text-red-600 transition-colors cursor-pointer"
        onClick={() => openModal(MODAL_TYPES.MAP)}
      >
        Select Branch
      </button>
    </div>
  );
};

export default BranchSelector;