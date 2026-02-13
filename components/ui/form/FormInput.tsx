import { AlertCircle } from "lucide-react";

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // ✅ Accept event
  error?: string;
  type?: "text" | "tel" | "email" | "password";
  placeholder?: string;
  maxLength?: number;
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
  maxLength,
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
        onChange={onChange} // ✅ Pass event directly
        placeholder={placeholder}
        maxLength={maxLength}
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