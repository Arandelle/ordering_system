import { AlertCircle } from "lucide-react";

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "tel" | "email";
  placeholder?: string;
  required?: boolean;
}

export const FormInput = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  required = false,
}: FormInputProps) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-[550] text-gray-600 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border ${error ? "border-red-500" : "border-gray-200"} focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};