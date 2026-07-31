import { ActivityLogEntry } from "@/hooks/api/useActivityLogs";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { formatDate } from "@/helper/formatter";
import {
  Table,
  TableBody,
  TableCard,
  TableCardHeader,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
  TableToolbar,
} from "@/components/ui/table";
import { SelectField } from "@/components/ui/FormComponents";

interface ActivityLogsTableProps {
  logs: ActivityLogEntry[];
  isPending: boolean;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  actorFilter: string;
  setActorFilter: (actor: string) => void;
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

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "order", label: "Orders" },
  { value: "payment", label: "Payments" },
  { value: "inventory", label: "Inventory" },
  { value: "voucher", label: "Vouchers" },
];

const ACTOR_OPTIONS = [
  { value: "all", label: "All Actors" },
  { value: "staff", label: "Staff" },
  { value: "customer", label: "Customers" },
  { value: "system", label: "System" },
  { value: "webhook", label: "Webhooks" },
];

const ActivityLogHeaders = ["Actor", "Action", "Target", "Detail", "Time"];

const ActivityLogsTable = ({
  logs,
  isPending,
  categoryFilter,
  actorFilter,
  setCategoryFilter,
  setActorFilter,
}: ActivityLogsTableProps) => {
  return (
    <TableCard>
      <TableCardHeader title="Recent Activity Logs" />
      <TableToolbar>
        <SelectField
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={CATEGORY_OPTIONS.map((opt) => ({
            label: opt.label,
            value: opt.value,
          }))}
        />
        <SelectField
          label="Actor"
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          options={ACTOR_OPTIONS.map((opt) => ({
            label: opt.label,
            value: opt.value,
          }))}
        />
      </TableToolbar>
      {isPending ? (
        <TableSkeleton columns={5} headers={ActivityLogHeaders} />
      ) : logs.length === 0 ? (
        <TableEmptyState
          icon="ScrollText"
          title="No activity logs found"
          description="Logs will appear here as actions are performed"
        />
      ) : (
        <Table>
          <TableHeader className="bg-gray-50 border-b border-gray-200">
            <TableRow className="border-0">
              {ActivityLogHeaders.map((header, i) => (
                <TableHead
                  key={i}
                  className="px-4 py-3 font-semibold text-gray-600"
                >
                  {header}
                </TableHead>
              ))}
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
      )}
    </TableCard>
  );
};

export default ActivityLogsTable;
