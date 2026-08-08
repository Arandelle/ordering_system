import { cn } from "@/lib/utils";
import React, { ComponentPropsWithoutRef } from "react";
import { DynamicIcon } from "../DynamicIcon";

export interface ButtonIconProps {
  name: string;
  size?: number;
  className?: string;
}

interface LegacyIconProps extends ButtonIconProps {
  position?: "left" | "right";
}

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  /** @deprecated Use `iconLeft` / `iconRight` instead. Kept for backward compatibility. */
  icon?: LegacyIconProps;
  iconLeft?: ButtonIconProps;
  iconRight?: ButtonIconProps;
  text?: string;
  title?: string;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success"
    | "disabled"
    | "underline";
  isLoading?: boolean;
  loadingText?: string;
  children?: React.ReactNode;
}

const DEFAULT_DISABLED =
  "disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-100";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: cn(
    "bg-brand-color-500 hover:bg-brand-color-600 text-white",
    DEFAULT_DISABLED,
  ),
  secondary: cn(
    "bg-gray-100 hover:bg-gray-200 text-gray-800",
    DEFAULT_DISABLED,
  ),
  outline: cn(
    "border border-gray-300 hover:bg-gray-50 text-gray-700",
    DEFAULT_DISABLED,
  ),
  ghost: cn("hover:bg-gray-100 text-gray-700", DEFAULT_DISABLED),
  danger: cn(
    "bg-red-500 hover:bg-red-600 text-white",
    "disabled:bg-red-200 disabled:cursor-not-allowed",
  ),
  success:
    "bg-green-500 text-white disabled:bg-green-500 disabled:text-white disabled:opacity-100 disabled:cursor-default",
  disabled: DEFAULT_DISABLED,
  underline:
    "text-brand-color-500 hover:text-brand-color-600 underline disabled:text-gray-500 disabled:cursor-not-allowed",
};

const IconButton = ({
  icon,
  iconLeft,
  iconRight,
  text,
  title,
  className,
  type = "button",
  variant = "primary",
  isLoading = false,
  loadingText = "Loading...",
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const resolvedLeft =
    iconLeft ?? (icon && icon.position !== "right" ? icon : undefined);
  const resolvedRight =
    iconRight ?? (icon && icon.position === "right" ? icon : undefined);

  const leftIconSize = resolvedLeft?.size ?? 14;
  const rightIconSize = resolvedRight?.size ?? 14;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 p-2 text-sm font-semibold transition-all cursor-pointer",
        variantClasses[variant],
        className,
      )}
      data-tooltip-id={title ? "app-tooltip" : undefined}
      data-tooltip-content={title}
      {...props}
    >
      {children ? (
        children
      ) : (
        <>
          {isLoading ? (
            <DynamicIcon
              name="Loader2"
              size={leftIconSize}
              className="animate-spin"
            />
          ) : (
            resolvedLeft && (
              <DynamicIcon
                name={resolvedLeft.name}
                size={leftIconSize}
                className={resolvedLeft.className}
              />
            )
          )}
          {text && <span>{isLoading ? loadingText : text}</span>}
          {!isLoading && resolvedRight && (
            <DynamicIcon
              name={resolvedRight.name}
              size={rightIconSize}
              className={resolvedRight.className}
            />
          )}
        </>
      )}
    </button>
  );
};

export default IconButton;
