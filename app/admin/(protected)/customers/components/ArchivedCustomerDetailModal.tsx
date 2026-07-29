"use client";

import { AppImage } from "@/components/AppImage";
import { IconButton } from "@/components/ui/buttons";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import Modal from "@/components/ui/Modal";
import { SummaryRow } from "@/components/ui/SummaryRow";
import { formatCurrency, formatDateOnly } from "@/helper/formatter";
import { apiClient } from "@/lib/apiClient";
import { ArchivedCustomer } from "@/types/CustomerAccountType";
import { useQuery } from "@tanstack/react-query";

interface ArchivedCustomerDetailModalProps {
  archivedId: string;
  onClose: () => void;
}

/** Fetches a single archived customer by ID */
const fetchArchivedCustomer = async (
  id: string,
): Promise<ArchivedCustomer> => {
  const res = await apiClient.get<{ data: ArchivedCustomer }>(
    `/admin/customers/archived/${id}`,
  );
  return res.data;
};

export default function ArchivedCustomerDetailModal({
  archivedId,
  onClose,
}: ArchivedCustomerDetailModalProps) {
  const { data: archived, isLoading } = useQuery({
    queryKey: ["archived-customer-detail", archivedId],
    queryFn: () => fetchArchivedCustomer(archivedId),
    enabled: !!archivedId,
  });

  return (
    <Modal
      title="Archived Account Details"
      subTitle={
        archived
          ? `${archived.firstName} ${archived.lastName}`
          : "Loading..."
      }
      onClose={onClose}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-stone-400 gap-2">
          <DynamicIcon name="Loader2" size={20} className="animate-spin" />
          Loading archived account...
        </div>
      ) : !archived ? (
        <p className="text-center text-stone-500 py-12">
          Archived account not found.
        </p>
      ) : (
        <div className="space-y-8">
          {/* Profile Section */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-stone-300 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden">
              {archived.image ? (
                <div className="w-full h-full object-cover">
                  <AppImage
                    src={archived.image}
                    alt={`${archived.firstName} photo`}
                  />
                </div>
              ) : (
                <span>{archived.firstName?.charAt(0) ?? "?"}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-stone-800">
                  {archived.firstName} {archived.lastName}
                </h3>
                <span className="text-xs font-semibold py-1 px-3 rounded-lg text-white bg-stone-500">
                  Archived
                </span>
              </div>
              <p className="text-sm text-stone-500 mt-0.5">{archived.email}</p>
              <p className="text-xs text-stone-400 mt-1 font-mono">
                Original ID: {archived.originalUserId}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <section>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
              Contact Information
            </h4>
            <div className="bg-stone-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <DynamicIcon
                  name="Mail"
                  size={16}
                  className="text-stone-400 shrink-0"
                />
                <span className="text-stone-700">{archived.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DynamicIcon
                  name="Phone"
                  size={16}
                  className="text-stone-400 shrink-0"
                />
                <span className="text-stone-700">
                  {archived.phone || "No phone number"}
                </span>
              </div>
            </div>
          </section>

          {/* Order Stats at Time of Deletion */}
          <section>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
              Stats at Time of Deletion
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <DynamicIcon
                  name="ShoppingBag"
                  size={24}
                  className="text-blue-500 mx-auto mb-2"
                />
                <p className="text-2xl font-bold text-stone-800">
                  {archived.stats?.totalOrders ?? 0}
                </p>
                <p className="text-xs text-stone-500 mt-1">Orders</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <DynamicIcon
                  name="Wallet"
                  size={24}
                  className="text-emerald-500 mx-auto mb-2"
                />
                <p className="text-2xl font-bold text-stone-800">
                  {formatCurrency(archived.stats?.totalSpent ?? 0)}
                </p>
                <p className="text-xs text-stone-500 mt-1">Total Spent</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <DynamicIcon
                  name="Star"
                  size={24}
                  className="text-amber-500 mx-auto mb-2"
                />
                <p className="text-2xl font-bold text-stone-800">
                  {archived.stats?.totalReviews ?? 0}
                </p>
                <p className="text-xs text-stone-500 mt-1">Reviews</p>
              </div>
            </div>

            {archived.stats?.totalOrders > 0 && (
              <div className="mt-3">
                <SummaryRow
                  title="Average per order"
                  subTitle={formatCurrency(
                    (archived.stats?.totalSpent ?? 0) /
                      (archived.stats?.totalOrders ?? 1),
                  )}
                />
              </div>
            )}
          </section>

          {/* Deletion Details */}
          <section>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
              Deletion Details
            </h4>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <DynamicIcon
                  name="Trash2"
                  size={16}
                  className="text-red-400 shrink-0"
                />
                <span className="text-stone-700">
                  Account deleted on{" "}
                  {archived.deletedAt
                    ? formatDateOnly(archived.deletedAt)
                    : "Unknown date"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DynamicIcon
                  name="Clock"
                  size={16}
                  className="text-amber-500 shrink-0"
                />
                <span className="text-stone-700">
                  Permanently purged on{" "}
                  {archived.scheduledDeletionAt
                    ? formatDateOnly(archived.scheduledDeletionAt)
                    : "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DynamicIcon
                  name="Archive"
                  size={16}
                  className="text-stone-400 shrink-0"
                />
                <span className="text-stone-700">
                  Archived on{" "}
                  {archived.archivedAt
                    ? formatDateOnly(archived.archivedAt)
                    : "Unknown"}
                </span>
              </div>
              {archived.deletionReason && (
                <div className="flex items-start gap-3 text-sm">
                  <DynamicIcon
                    name="MessageSquare"
                    size={16}
                    className="text-stone-400 shrink-0 mt-0.5"
                  />
                  <span className="text-stone-700">
                    Reason: {archived.deletionReason}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2 border-t border-stone-100">
            <IconButton
              onClick={onClose}
              variant="outline"
              className="rounded-lg px-6"
              text="Close"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
