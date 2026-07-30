import { ActivityLogEntry } from "@/hooks/api/useActivityLogs";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import LoadingPage from "@/components/ui/LoadingPage";
import { formatDate } from "@/helper/formatter";
import {
  Table,
  TableBody,
  TableCard,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ActivityLogsTableProps {
  logs: ActivityLogEntry[];
  isPending: boolean;
}

/**
 * Color map for actor type badges
 */
const ACTOR_BADGE: Record<string, string> = {
  staff: "bg-blue-100 text-blue-700",
  customer: "bg-green-100 text-green-700",
  system: "bg-gray-100 text-gray-600",
  webhook: "bg-amber-100 text-amber-700",
};

/**
 * Icon map for action categories
 */
const CATEGORY_ICON: Record<string, string> = {
  order: "ShoppingCart",
  payment: "CreditCard",
  inventory: "Archive",
  voucher: "Ticket",
};

/**
 * Human-readable category labels
 */
const CATEGORY_LABEL: Record<string, string> = {
  order: "Order",
  payment: "Payment",
  inventory: "Inventory",
  voucher: "Voucher",
};

/**
 * Extract a meaningful detail from the metadata for display
 */
function extractDetail(log: ActivityLogEntry): string | null {
  const m = log.metadata;
  if (!m) return null;

  // Order status change
  if (m.from && m.to) {
    return `${String(m.from)} → ${String(m.to)}`;
  }

  // Payment event
  if (m.paymentMethod && m.paymentStatus) {
    return `${String(m.paymentMethod)} — ${String(m.paymentStatus)}`;
  }

  // Inventory event
  if (m.quantity !== undefined) {
    return `${m.quantity} unit${Number(m.quantity) !== 1 ? "s" : ""}`;
  }

  // Voucher event
  if (m.amount !== undefined) {
    return `₱${Number(m.amount).toFixed(2)}`;
  }

  return null;
}

const ActivityLogsTable = ({ logs, isPending }: ActivityLogsTableProps) => {
  if (isPending) {
    return (
      <TableCard>
        <div className="p-8">
          <LoadingPage />
        </div>
      </TableCard>
    );
  }

  if (logs.length === 0) {
    return (
      <TableCard>
        <TableEmptyState
          icon="ScrollText"
          title="No activity logs found"
          description="Logs will appear here as actions are performed"
        />
      </TableCard>
    );
  }

  return (
    <TableCard>
      <div className="overflow-x-auto">
        <Table className="w-full text-sm">
          <TableHeader className="bg-gray-50 border-b border-gray-200">
            <TableRow className="border-0">
              <TableHead className="px-4 py-3 font-semibold text-gray-600">
                Actor
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-gray-600">
                Action
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-gray-600">
                Target
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-gray-600">
                Detail
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-gray-600">
                Time
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {logs.map((log) => {
              const actorName =
                log.actor.actorType === "staff"
                  ? (log.actor.staffName ?? "Staff")
                  : log.actor.actorType === "customer"
                    ? (log.actor.customerName ?? "Customer")
                    : log.actor.actorType === "webhook"
                      ? "Payment Gateway"
                      : "System";

              const detail = extractDetail(log);

              return (
                <TableRow
                  key={log._id}
                  className="hover:bg-gray-50/50 transition-colors border-0"
                >
                  {/* Actor */}
                  <TableCell className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ACTOR_BADGE[log.actor.actorType] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {actorName}
                      </span>
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <DynamicIcon
                        name={CATEGORY_ICON[log.category] ?? "CircleDot"}
                        size={16}
                        className="text-gray-400"
                      />
                      <span className="font-medium text-gray-800">
                        {CATEGORY_LABEL[log.category] ?? log.category}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {log.action.split(".").pop()}
                      </span>
                    </div>
                  </TableCell>

                  {/* Target */}
                  <TableCell className="px-4 py-3 text-left">
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium">
                        {log.target.label ?? log.target.entityType}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {log.target.entityType}
                      </span>
                    </div>
                  </TableCell>

                  {/* Detail */}
                  <TableCell className="px-4 py-3 text-left">
                    {detail ? (
                      <span className="text-gray-500 text-xs font-mono">
                        {detail}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Time */}
                  <TableCell className="px-4 py-3 text-left">
                    <span className="text-gray-400">
                      {formatDate(log.createdAt)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TableCard>
  );
};

export default ActivityLogsTable;
