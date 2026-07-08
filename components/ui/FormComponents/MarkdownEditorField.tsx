"use client";

import dynamic from "next/dynamic";

/** Load MDEditor dynamically to avoid SSR issues (it relies on browser APIs) */
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorFieldProps {
  /** Field id for the label's htmlFor attribute */
  id?: string;
  label?: string;
  subLabel?: string;
  error?: string;
  /** Markdown string value */
  value?: string;
  /** Callback with the updated markdown string (MDEditor passes raw value, not an event) */
  onChange?: (value: string) => void;
  /** Editor height in pixels (default 300) */
  height?: number;
  required?: boolean;
  disabled?: boolean;
}

/**
 * A markdown editor field with toolbar buttons for bold, italic,
 * headings, lists, links, etc. — so admins don't need to type
 * markdown syntax manually.
 *
 * MDEditor's onChange signature is (value: string, ev, state),
 * so we expose only the string portion for simplicity.
 */
export const MarkdownEditorField = ({
  label,
  subLabel,
  error,
  value,
  onChange,
  height = 300,
  id,
  required,
  disabled,
}: MarkdownEditorFieldProps) => {
  return (
    <div className="w-full space-y-2" data-color-mode="light">
      <div className="m-0">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {subLabel && (
          <p className="text-xs text-gray-600 mb-2">{subLabel}</p>
        )}
      </div>

      <div className={disabled ? "pointer-events-none opacity-50" : ""}>
        <MDEditor
          value={value ?? ""}
          onChange={(val) => onChange?.(val ?? "")}
          height={height}
          preview="edit"
          hideToolbar={disabled}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
