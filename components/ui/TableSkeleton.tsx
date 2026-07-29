import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  /** Number of columns per row */
  columns: number;
  /** Number of skeleton rows to render */
  rows?: number;
}

// Reusable skeleton body — drop inside an existing <Table> that already has headers
export function TableSkeleton({ columns, rows = 10 }: TableSkeletonProps) {
  return (
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
  );
}
