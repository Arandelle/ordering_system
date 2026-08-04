import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SectionHeaderProps = {
  /** Accepts a plain string or JSX — e.g. <>Orders — <span className="text-brand-color-500">{branch}</span></> */
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  breadcrumb?: {
    href: string;
    name: string;
    className?: string;
  }[];
  /** Optional action buttons rendered to the right of the header */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * SectionHeader component
 *
 * @param {SectionHeaderProps} props - Component props
 * @param {string} props.title - Main title of the section
 * @param {string} [props.subTitle] - Optional subtitle/description
 * @param {React.ReactNode} [props.breadcrumb] - Optional breadcrumb shown above the title
 * @param {React.ReactNode} [props.actions] - Optional actions (buttons) shown on the right
 * @param {string} [props.className] - Optional class names for the outer wrapper
 *
 * @returns JSX.Element
 */
const SectionHeader = ({
  title,
  subTitle,
  breadcrumb,
  actions,
  className,
}: SectionHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="">
        {breadcrumb &&
          breadcrumb.length > 0 &&
          breadcrumb.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "text-gray-400 hover:text-brand-color-600 mb-2",
                item.className,
              )}
            >
              {item.name}
              {" "} &rsaquo;{" "}
            </Link>
          ))}

        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-0 md:mb-2">
          {title}
        </h1>

        {subTitle && (
          <p className="text-sm lg:text-lg text-gray-500">{subTitle}</p>
        )}
      </div>

      {actions && <div className="shrink-0 ml-4">{actions}</div>}
    </div>
  );
};

export default SectionHeader;
