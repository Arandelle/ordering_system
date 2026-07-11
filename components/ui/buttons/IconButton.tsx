import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { DynamicIcon } from "../DynamicIcon";

interface IconButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  icon: {
    name: string;
    size?: number;
    className?: string;
  };
  title?: string;
}


const IconButton = ({
  icon,
  title,
  className,
  type = "button",
  ...props
}: IconButtonProps) => {
  return (
    <button
      type={type}
      className={twMerge(
        clsx(
          "p-1.5 rounded-full transition-colors cursor-pointer"
        ),
        className
      )}
      title={title ?? "Icon button"}
      data-tooltip-id="app-tooltip"
      data-tooltip-content={title}
      {...props}
    >
      <DynamicIcon
        name={icon.name}
        size={icon.size ?? 14}
        className={icon.className}
      />
    </button>
  );
};

export default IconButton;