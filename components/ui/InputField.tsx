"use client";

import React, { forwardRef, InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, leftIcon, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {label} {props.required ? <span className="text-red-500">*</span> : ""}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            {...props}
            className={clsx(
              "w-full pr-4 py-3 border border-gray-300 rounded-lg outline-none transition focus:ring-2 focus:ring-[#ef4501] focus:border-[#ef4501]/20",
              leftIcon ? "pl-10" : "pl-4",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
