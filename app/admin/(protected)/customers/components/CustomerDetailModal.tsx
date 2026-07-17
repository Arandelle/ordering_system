"use client";

import { AppImage } from "@/components/AppImage";
import { IconButton } from "@/components/ui/buttons";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import Modal from "@/components/ui/Modal";
import { SummaryRow } from "@/components/ui/SummaryRow";
import { formatCurrency, formatDateOnly } from "@/helper/formatter";
import { apiClient } from "@/lib/apiClient";
import { CustomerResponse } from "@/types/CustomerAccountType";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CustomerDetailModalProps {
  customerId: string;
  onClose: () => void;
}

/** Fetches a single customer with enriched order stats */
const fetchCustomer = async (id: string): Promise<CustomerResponse> => {
  const res = await apiClient.get<{ data: CustomerResponse }>(
    `/admin/customers/${id}`,
  );
  return res.data;
};

export default function CustomerDetailModal({
  customerId,
  onClose,
}: CustomerDetailModalProps) {
  const queryClient = useQueryClient();

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer-detail", customerId],
    queryFn: () => fetchCustomer(customerId),
    enabled: !!customerId,
  });

  const toggleBan = useMutation({
    mutationFn: (action: "ban" | "unban") =>
      apiClient.patch(`/admin/customers/${customerId}`, { action }),
    onSuccess: (_, action) => {
      toast.success(
        action === "ban"
          ? "Customer account has been suspended"
          : "Customer account has been reactivated",
      );
      queryClient.invalidateQueries({
        queryKey: ["customer-detail", customerId],
      });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => {
      toast.error("Failed to update customer status");
    },
  });

  const isBanned = customer?.banned === true;

  return (
    <Modal
      title="Customer Details"
      subTitle={
        customer ? `${customer.firstName} ${customer.lastName}` : "Loading..."
      }
      onClose={onClose}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-stone-400 gap-2">
          <DynamicIcon name="Loader2" size={20} className="animate-spin" />
          Loading customer details...
        </div>
      ) : !customer ? (
        <p className="text-center text-stone-500 py-12">Customer not found.</p>
      ) : (
        <div className="space-y-8">
          {/* ── Profile Section ── */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden">
              {customer.image ? (
                <div className="w-full h-full object-cover">
                  <AppImage
                    src={customer.image}
                    alt={`${customer.firstName} photo`}
                  />
                </div>
              ) : (
                <span>{customer.firstName?.charAt(0) ?? "?"}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-stone-800">
                  {customer.firstName} {customer.lastName}
                </h3>
                <span
                  className={`text-xs font-semibold py-1 px-3 rounded-lg text-white ${
                    isBanned ? "bg-red-500" : "bg-emerald-500"
                  }`}
                >
                  {isBanned ? "Suspended" : "Active"}
                </span>
              </div>
              <p className="text-sm text-stone-500 mt-0.5">{customer.email}</p>
              <p className="text-xs text-stone-400 mt-1 font-mono">
                ID: {customer._id}
              </p>
            </div>
          </div>

          {/* ── Contact Info ── */}
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
                <span className="text-stone-700">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DynamicIcon
                  name="Phone"
                  size={16}
                  className="text-stone-400 shrink-0"
                />
                <span className="text-stone-700">
                  {customer.phone || "No phone number"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DynamicIcon
                  name="Calendar"
                  size={16}
                  className="text-stone-400 shrink-0"
                />
                <span className="text-stone-700">
                  Joined{" "}
                  {customer.createdAt
                    ? formatDateOnly(customer.createdAt)
                    : "Unknown"}
                </span>
              </div>
            </div>
          </section>

          {/* ── Order Stats ── */}
          <section>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
              Order Summary
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <DynamicIcon
                  name="ShoppingBag"
                  size={24}
                  className="text-blue-500 mx-auto mb-2"
                />
                <p className="text-2xl font-bold text-stone-800">
                  {customer.totalOrders ?? 0}
                </p>
                <p className="text-xs text-stone-500 mt-1">Total Orders</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <DynamicIcon
                  name="Wallet"
                  size={24}
                  className="text-emerald-500 mx-auto mb-2"
                />
                <p className="text-2xl font-bold text-stone-800">
                  {formatCurrency(customer.totalSpent)}
                </p>
                <p className="text-xs text-stone-500 mt-1">Total Spent</p>
              </div>
            </div>

            {customer.totalOrders > 0 && (
              <div className="mt-3">
                <SummaryRow
                  title="Average per order"
                  subTitle={formatCurrency(
                    (customer.totalSpent ?? 0) / customer.totalOrders,
                  )}
                />
              </div>
            )}
          </section>

          {/* ── Account Status Details ── */}
          <section>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
              Account Status
            </h4>
            <div className="bg-stone-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <DynamicIcon
                  name={isBanned ? "ShieldOff" : "ShieldCheck"}
                  size={16}
                  className={`shrink-0 ${isBanned ? "text-red-500" : "text-emerald-500"}`}
                />
                <span className="text-stone-700">
                  {isBanned
                    ? "Account suspended — cannot log in or place orders"
                    : "Account active — can log in and place orders"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DynamicIcon
                  name={customer.emailVerified ? "CheckCircle" : "Ban"}
                  size={16}
                  className={`shrink-0 ${customer.emailVerified ? "ext-emerald-500" : "text-amber-500"}`}
                />
                <span className="text-stone-700">
                  Email {customer.emailVerified ? "verified" : "not verified"}
                </span>
              </div>
            </div>
          </section>

          {/* ── Action Buttons ── */}
          <div className="flex gap-3 justify-end pt-2 border-t border-stone-100">
            <IconButton
              onClick={onClose}
              variant="outline"
              className="rounded-lg px-6"
              text="Close"
            />
            <IconButton
              onClick={() => toggleBan.mutate(isBanned ? "unban" : "ban")}
              disabled={toggleBan.isPending}
              variant={isBanned ? "success" : "danger"}
              text={isBanned ? "Reactive Account" : "Suspend Account"}
              icon={{
                name: toggleBan.isPending
                  ? "Loader2"
                  : isBanned
                    ? "ShieldCheck"
                    : "ShieldOff",
                size: 16,
                className: toggleBan.isPending ? "animate-spin" : "",
              }}
              className="rounded-lg px-6"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
