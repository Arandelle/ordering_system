import * as React from "react";

import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full min-w-225 text-left text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-stone-100 text-xs uppercase text-stone-500",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle text-muted-foreground [&:has([role=checkbox])]:pr-0 font-bold",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0 text-center",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// ─── Card, Header, Toolbar & State Wrappers ──────────────────────────────────

/** White card wrapper used around all admin tables */
const TableCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white border border-stone-100 overflow-hidden",
      className,
    )}
    {...props}
  />
));
TableCard.displayName = "TableCard";

interface TableCardHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional action slot rendered on the right (e.g. add button) */
  actions?: React.ReactNode;
  className?: string;
}

/** Card-internal header with title, subtitle, and optional action button */
function TableCardHeader({ title, subtitle, actions, className }: TableCardHeaderProps) {
  return (
    <div className={cn("px-6 py-5 border-b border-stone-100", className)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-stone-800">{title}</h3>
          {subtitle && <p className="text-sm text-stone-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

/** Toolbar row for search + filters + sort — sits inside TableCard, below the header */
const TableToolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-end gap-3 px-6 py-4 border-b border-stone-100",
      className,
    )}
    {...props}
  />
));
TableToolbar.displayName = "TableToolbar";

/** Loading state — standalone component, renders its own Table inside TableCard */
interface TableSkeletonProps {
  /** Number of columns per row */
  columns: number;
  /** Number of skeleton rows to render */
  rows?: number;
  /** Optional column header labels to display at the top */
  headers?: string[];
}

function TableSkeleton({ columns, rows = 10, headers }: TableSkeletonProps) {
  return (
    <Table>
      {headers && headers.length > 0 && (
        <TableHeader>
          <TableRow>
            {headers.map((h, i) => (
              <TableHead
                key={i}
                className="text-xs font-semibold uppercase tracking-wider text-center"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
      <TableBody className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex} className="animate-pulse">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={colIndex} className="px-6 py-4">
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface TableEmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  className?: string;
}

/** Empty state — renders inside TableCard when there's no data */
function TableEmptyState({
  icon = "Inbox",
  title = "No records found",
  description,
  className,
}: TableEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-gray-400",
        className,
      )}
    >
      <DynamicIcon name={icon} size={48} />
      <p className="mt-4 text-sm font-medium">{title}</p>
      {description && <p className="text-xs">{description}</p>}
    </div>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableCard,
  TableCardHeader,
  TableToolbar,
  TableSkeleton,
  TableEmptyState,
};
