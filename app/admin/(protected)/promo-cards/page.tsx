"use client";

import LoadingPage from "@/components/ui/LoadingPage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/apiClient";
import { PROMO_CARD } from "@/lib/promoCard";
import { useQuery } from "@tanstack/react-query";
import { BadgePercent, CreditCard, Hourglass, Users } from "lucide-react";

type PromoCardPurchaseStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled";

type PromoCardPurchase = {
  _id: string;
  referenceNumber: string;
  status: PromoCardPurchaseStatus;
  paymentStatus?: string;
  firstName: string;
  lastName: string;
  customerEmail: string;
  customerPhone: string;
  purchasePrice: number;
  discountRate: number;
  createdAt: string;
  paidAt?: string;
};

type PromoCardResponse = {
  data: PromoCardPurchase[];
  stats: {
    total: number;
    paid: number;
    pending: number;
    paidRevenue: number;
  };
};

const statusStyles: Record<PromoCardPurchaseStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

function formatDate(value?: string) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PromoCardsPage() {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "promo-cards"],
    queryFn: () => apiClient.get<PromoCardResponse>("/admin/promo-cards"),
  });

  if (isLoading) return <LoadingPage />;
  if (error) return <p>Error loading promo card purchases</p>;

  const purchases = response?.data ?? [];
  const stats = response?.stats ?? {
    total: 0,
    paid: 0,
    pending: 0,
    paidRevenue: 0,
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">
          Promo Cards
        </h1>
        <p className="text-stone-500">
          View authenticated customer promo-card purchases and payment status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-stone-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-color-500 text-white">
              <BadgePercent />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Requests</p>
              <p className="text-2xl font-bold text-stone-800">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <Users />
            </div>
            <div>
              <p className="text-sm text-stone-500">Paid Cards</p>
              <p className="text-2xl font-bold text-stone-800">
                {stats.paid}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white">
              <Hourglass />
            </div>
            <div>
              <p className="text-sm text-stone-500">Pending</p>
              <p className="text-2xl font-bold text-stone-800">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <CreditCard />
            </div>
            <div>
              <p className="text-sm text-stone-500">Paid Revenue</p>
              <p className="text-2xl font-bold text-stone-800">
                ₱{stats.paidRevenue.toLocaleString("en-PH")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-stone-500"
                  >
                    No promo card purchases yet.
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => (
                  <TableRow key={purchase._id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-stone-800">
                          {purchase.firstName} {purchase.lastName}
                        </p>
                        <p className="text-xs text-stone-500">
                          {purchase.customerEmail}
                        </p>
                        <p className="text-xs text-stone-500">
                          {purchase.customerPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {purchase.referenceNumber}
                    </TableCell>
                    <TableCell>
                      {(purchase.discountRate * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell>
                      ₱{purchase.purchasePrice.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[purchase.status]}`}
                      >
                        {purchase.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                    <TableCell>{formatDate(purchase.paidAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-stone-400">
        Current rule: {PROMO_CARD.name} gives{" "}
        {(PROMO_CARD.discountRate * 100).toFixed(0)}% off eligible orders.
      </p>
    </section>
  );
}
