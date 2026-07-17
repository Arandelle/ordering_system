import { cn } from "@/lib/utils";

export const SummaryRow = ({
  title,
  subTitle,
  className,
}: {
  title: string;
  subTitle: string;
  className?: {
    parent?: string;
    title?: string;
    subTitle?: string;
  };
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-sm text-gray-500",
        className?.parent,
      )}
    >
      <span className={cn("truncate min-w-0", className?.title)}>{title}</span>
      <span className={cn("", className?.subTitle)}>{subTitle}</span>
    </div>
  );
};
