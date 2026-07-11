// ─── Sub-components ───────────────────────────────────────────────────────────

import { DynamicIcon } from "@/components/ui/DynamicIcon";

export const QuantityStepper = ({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (val: number) => void;
  min?: number;
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow empty while typing
    if (raw === "") {
      onChange(min);
      return;
    }

    const parsed = Number(raw);

    if (isNaN(parsed)) return;

    onChange(Math.max(min, parsed));
  };

  return (
    <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden h-full">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <DynamicIcon name="Minus" size={12} />
      </button>

      <input
        type="number"
        value={value}
        min={min}
        onChange={handleInputChange}
        className="w-10 text-center outline-none"
      />

      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <DynamicIcon name="Plus" size={12} />
      </button>
    </div>
  );
};
