import { DynamicIcon } from "@/lib/DynamicIcon";

export const SectionCard = ({
  children,
  title,
  subtitle,
  icon,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
      <div className="w-9 h-9 bg-brand-color-100 rounded-xl flex items-center justify-center">
        <DynamicIcon
          name={icon as any}
          size={18}
          className="text-brand-color-500"
        />
      </div>
      <div>
        <h3 className={`font-bold text-gray-900 text-base`}>{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);
