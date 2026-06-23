import { ActivityLogEntry } from "@/hooks/api/useActivityLogs";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import LoadingPage from "@/components/ui/LoadingPage";

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
 * Format a relative time string (e.g. "2 hours ago")
 */
function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000,
  );

  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];

  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) {
      return `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-8">
          <LoadingPage />
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-16 text-gray-400">
        <DynamicIcon name="ScrollText" size={48} />
        <p className="mt-4 text-sm font-medium">No activity logs found</p>
        <p className="text-xs">
          Logs will appear here as actions are performed
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Actor
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Action
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Target
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Detail
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => {
              const actorName =
                log.actor.actorType === "staff"
                  ? log.actor.staffName ?? "Staff"
                  : log.actor.actorType === "customer"
                    ? log.actor.customerName ?? "Customer"
                    : log.actor.actorType === "webhook"
                      ? "Payment Gateway"
                      : "System";

              const detail = extractDetail(log);

              return (
                <tr
                  key={log._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {/* Actor */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ACTOR_BADGE[log.actor.actorType] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {actorName}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DynamicIcon
                        name={
                          CATEGORY_ICON[log.category] ??
                          "CircleDot"
                        }
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
                  </td>

                  {/* Target */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium">
                        {log.target.label ?? log.target.entityType}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {log.target.entityType}
                      </span>
                    </div>
                  </td>

                  {/* Detail */}
                  <td className="px-4 py-3">
                    {detail ? (
                      <span className="text-gray-500 text-xs font-mono">
                        {detail}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Time */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-xs">
                        {timeAgo(log.createdAt)}
                      </span>
                      <span className="text-gray-300 text-[10px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogsTable;
