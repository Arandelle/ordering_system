import MetricCard from "@/components/ui/MetricCard";
import { InventoryCounts } from "@/hooks/api/useBranchInventory";

interface Props {
  counts: InventoryCounts;
}

export default function InventorySummaryCards({ counts }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricCard
        title="Total Items"
        value={counts.total}
        icon="Package"
        iconColor="bg-slate-500"
      />
      <MetricCard
        title="In Stock"
        value={counts.inStock}
        icon="CheckCircle"
        iconColor="bg-green-500"
      />
      <MetricCard
        title="Low Stock"
        value={counts.lowStock}
        icon="AlertTriangle"
        iconColor="bg-yellow-500"
      />
      <MetricCard
        title="Out of Stock"
        value={counts.outOfStock}
        icon="XCircle"
        iconColor="bg-red-500"
      />
    </div>
  );
}
