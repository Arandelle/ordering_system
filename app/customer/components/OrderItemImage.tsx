import { DynamicIcon } from "@/lib/DynamicIcon";

export const OrderItemImage = ({ image }: { image: string }) => {
  return (
    <object
      data={image}
      type="image/jpeg"
      className="w-full h-full object-cover"
    >
      <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50">
        <DynamicIcon name="Flame" size={20} className="text-orange-200" />
        <p className="text-xs">No image found</p>
      </div>
    </object>
  );
};