import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { OrderItemImage } from "../../components/OrderItemImage";

/* ─── Image mosaic ───────────────────────────────────────────────────── */
export function ItemMosaic({
  items,
}: {
  items: Array<{ image?: string; name: string }>;
}) {
  const SIZE = "w-[140px] h-[140px] flex-shrink-0";

  // Single item → full square image
  if (items.length === 1) {
    return (
      <div className={`${SIZE} overflow-hidden bg-gray-100`}>
        {items[0].image ? (
          <OrderItemImage image={items[0].image} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <DynamicIcon name="Package" size={32} className="text-gray-300" />
          </div>
        )}
      </div>
    );
  }

  // Multiple items → top slot + bottom slot (with +N overlay if needed)
  const [first, second] = items;
  const extra = items.length - 2;

  return (
    <div className={`${SIZE} grid grid-rows-2 gap-px bg-gray-200`}>
      {/* Top slot */}
      <div className="overflow-hidden bg-gray-100 relative">
        {first?.image ? (
          <OrderItemImage image={first.image}/>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <DynamicIcon name="Package" size={22} className="text-gray-300" />
          </div>
        )}
      </div>

      {/* Bottom slot — may show +N overlay */}
      <div className="relative overflow-hidden bg-gray-100">
        {second?.image ? (
           <OrderItemImage image={second.image}/>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <DynamicIcon name="Package" size={22} className="text-gray-300" />
          </div>
        )}
        {extra > 0 && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <span className="text-white text-[13px] font-medium">+{extra}</span>
          </div>
        )}
      </div>
    </div>
  );
}