"use client";

import React, { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface ToggleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  error?: string;
  subLabel?: string;
}

const ToggleButton = ({
  label,
  checked,
  onCheckedChange,
  error,
  subLabel,
  className,
  disabled,
  ...props
}: ToggleButtonProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onCheckedChange(!checked)}
          className={twMerge(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
            "focus-visible:ring-2 focus-visible:ring-brand-color-400 focus-visible:ring-offset-2",
            checked ? "bg-brand-color-500" : "bg-gray-200",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
          {...props}
        >
          <span
            aria-hidden="true"
            className={twMerge(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              checked ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>

        {label && (
          <div>
            <p className="text-sm font-semibold text-gray-700 select-none">
              {label}
            </p>
            {subLabel && (
              <p className="text-xs text-gray-600 select-none">{subLabel}</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default ToggleButton;