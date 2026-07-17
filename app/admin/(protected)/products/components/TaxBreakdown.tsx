// ─── Tax Breakdown UI ─────────────────────────────────────────────────────────

import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { computeTax } from "../helper/computeTax";
import { formatCurrency } from "@/helper/formatter";
import { SummaryRow } from "@/components/ui/SummaryRow";

export const TaxBreakdown = ({ price }: { price: string }) => {
  const { taxable, tax, total } = computeTax(price);
  const hasValue = total > 0;

  return (
    <>
      <div
        className={`rounded-xl border transition-all duration-300 overflow-hidden ${
          hasValue
            ? "border-brand-color-500/20 bg-brand-color-500/5"
            : "border-gray-100 bg-gray-50/60"
        }`}
      >
        <div
          className={`flex items-center gap-2 px-4 py-2.5 border-b text-xs font-bold uppercase tracking-widest ${
            hasValue
              ? "border-brand-color-500/10 text-brand-color-500"
              : "border-gray-100 text-gray-400"
          }`}
        >
          <DynamicIcon name="Wallet" size={13} />
          VAT Breakdown (12%)
        </div>
        <div className="px-4 py-3 space-y-2">
          <SummaryRow
            title="Taxable Amount"
            subTitle={hasValue ? formatCurrency(taxable) : "₱ 0.00"}
            className={{
              subTitle: hasValue ? "text-gray-700" : "text-gray-300",
            }}
          />
          <SummaryRow
            title="VAT (12%)"
            subTitle={hasValue ? formatCurrency(tax) : "₱ 0.00"}
            className={{
              subTitle: hasValue ? "text-brand-color-500" : "text-gray-300",
            }}
          />
          <SummaryRow
            title="Total Price"
            subTitle={hasValue ? formatCurrency(total) : "₱ 0.00"}
            className={{
              parent: "border-t border-t-brand-color-500/15 py-2",
              title: "font-semibold",
              subTitle: hasValue ? "text-gray-800 font-bold" : "text-gray-300",
            }}
          />
        </div>
      </div>
      <p className="flex items-start gap-1.5 text-[11px] text-gray-400 leading-relaxed">
        <DynamicIcon name="Info" size={11} className="mt-0.5 shrink-0" />
        Selling price is VAT-inclusive. Tax is back-computed at 12%.
      </p>
    </>
  );
};
