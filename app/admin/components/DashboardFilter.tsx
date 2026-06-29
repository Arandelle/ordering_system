import { SelectField } from "@/components/ui/FormComponents";
import { DashboardPeriod } from "@/services/admin/dashboard.service";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

/** Generate year options from current uear back to 2023 */
function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 2023; year--) {
    years.push({
      value: year,
      label: String(year),
    });
  }

  return years;
}

type FilterMode = "week" | "month" | "year";

interface DashboardFilterProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}

export default function DashboardFilter({
  value,
  onChange,
}: DashboardFilterProps) {
  const yearOptions = getYearOptions();

  // Derive the current mode from the period value
  const mode: FilterMode = value.range;

  // for month mode, derive the selected month/year from the period
  const selectedMonth =
    value.range === "month" ? value.month : new Date().getMonth() + 1;
  const selectedYear =
    value.range === "month"
      ? value.year
      : value.range == "year"
        ? value.year
        : new Date().getFullYear();

  const handleModeChange = (newMode: FilterMode) => {
    const now = new Date();
    if (newMode === "week") {
      onChange({ range: "week" });
    } else if (newMode === "month") {
      onChange({
        range: "month",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
    } else {
      onChange({ range: "year", year: now.getFullYear() });
    }
  };

  const handleMonthChange = (month: number) => {
    onChange({ range: "month", month, year: selectedYear });
  };

  const handleYearChange = (year: number) => {
    if (mode === "month") {
      onChange({ range: "month", month: selectedMonth, year });
    } else {
      onChange({ range: "year", year });
    }
  };

  return (
    <div className="inline-flex items-center gap-3">
      {/** Mode toggle buttons */}
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1.5">
        {(["week", "month", "year"] as FilterMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleModeChange(m)}
            className={`px-4 py-1.5 rounded-md text-nowrap font-medium transition-colors ${mode === m ? "bg-brand-color-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"} `}
          >
            {m === "week" ? "This week" : m === "month" ? "Month" : "Year"}
          </button>
        ))}
      </div>

      {/** Month dropdonw - visible only in month mode */}
      {mode === "month" && (
        <SelectField
          value={selectedMonth}
          onChange={(e) => handleMonthChange(Number(e.target.value))}
          options={[
            ...MONTHS.map((m) => ({
              value: String(m.value),
              label: m.label,
            })),
          ]}
        />
      )}

      {/** Year dropdown - visible in month and year modes */}
      {mode !== "week" && (
        <SelectField
          value={selectedYear}
          onChange={(e) => handleYearChange(Number(e.target.value))}
          options={[
            ...yearOptions.map((y) => ({
              value: String(y.value),
              label: y.label,
            })),
          ]}
        />
      )}
    </div>
  );
}
