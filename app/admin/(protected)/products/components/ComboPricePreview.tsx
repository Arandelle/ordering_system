import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { SummaryRow } from "@/components/ui/SummaryRow";
import { formatCurrency } from "@/helper/formatter";
import { ModifierGroupUI } from "@/types/products";

interface ComboPricePreviewProps {
  price: string;
  modifierGroups: ModifierGroupUI[];
}

const ComboPricePreview = ({
  price,
  modifierGroups,
}: ComboPricePreviewProps) => {
  return (
    <div className="px-4 py-3 bg-brand-color-500/5 border border-brand-color-500/20 rounded-xl space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-color-500">
        <DynamicIcon name="Calculator" size={13} />
        Price Preview
      </div>
      <SummaryRow
        title="Base combo price"
        subTitle={formatCurrency(parseFloat(price))}
        className={{
          subTitle: "text-gray-700",
        }}
      />
      {modifierGroups.map((group, gi) => (
        <div key={gi} className="space-y-1">
          <span className="text-xs font-semibold text-brand-color-500">
            {group.name || `Group ${gi + 1}`}
          </span>
          {group.items.map((item, ii) => {
            const upgradePrice = item.price ?? item._price ?? 0;
            const soloPrice = item._price ?? 0;
            const isDiscounted = upgradePrice < soloPrice && soloPrice > 0;
            return (
              <SummaryRow
                key={ii}
                title={item._name || `Item ${ii + 1}`}
                subTitle={
                  upgradePrice === 0
                    ? "PHP 0.00"
                    : `+ ${formatCurrency(upgradePrice)}`
                }
                className={{
                  parent: "pl-2 text-gray-700 text-xs",
                  subTitle: `${
                    isDiscounted
                      ? "text-green-600 font-semibold"
                      : "text-gray-700"
                  }`,
                }}
              />
            );
          })}
        </div>
      ))}
      <div className="h-px bg-brand-color-500/15" />
      <SummaryRow
        title="  Customer total (if all items selected)"
        subTitle={formatCurrency(
          parseFloat(price) +
            modifierGroups.reduce(
              (sum, g) =>
                sum +
                g.items.reduce((is, i) => is + (i.price ?? i._price ?? 0), 0),
              0,
            ),
        )}
        className={{
          subTitle: "text-sm text-brand-color-500 font-bold",
        }}
      />
    </div>
  );
};

export default ComboPricePreview;
