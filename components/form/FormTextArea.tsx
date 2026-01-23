import { AlertCircle } from "lucide-react";

interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  rows = 3,
  required = false,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-[550] text-gray-700 mb-1"
      >
        {label} {required && "*"}
      </label>
      <textarea
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl border ${
          error ? "border-red-500" : "border-gray-200"
        } focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all resize-none`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};