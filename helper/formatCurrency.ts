export function formatCurrency(value: number | null) {

  if(!value) return '--'

  return `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
} 