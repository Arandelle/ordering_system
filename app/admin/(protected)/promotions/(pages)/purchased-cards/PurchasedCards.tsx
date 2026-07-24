import SectionHeader from "@/app/admin/components/SectionHeader";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/helper/formatter/";
import { usePromoCards } from "../../hooks/usePromoCards";
import LoadingPage from "@/components/ui/LoadingPage";
import { PromoCardPurchaseStatus } from "../../types/promo-card.type";
import { StatCard } from "@/components/ui/StatCard";

const statusStyles: Record<PromoCardPurchaseStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

const PurchasedCards = () => {
  const { data: response, isLoading, error } = usePromoCards();

  if (isLoading) return <LoadingPage />;
  if (error) return <p>Error loading promo cards</p>;

  const purchases = response?.data ?? [];
  const stats = response?.stats ?? {
    total: 0,
    paid: 0,
    pending: 0,
    paidRevenue: 0,
  };

  const promoCardStats = [
    {
      label: "Total Request",
      value: stats.total,
    },
    {
      label: "Paid Cards",
      value: stats.paid,
    },
    {
      label: "Pending",
      value: stats.pending,
    },
    {
      label: "Paid Revenue",
      value: stats.paidRevenue,
      isCurrency: true,
    },
  ];

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Promo Cards"
        subTitle="View authenticated customer promo-card purchases and payment status."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {promoCardStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            isCurrency={stat.isCurrency}
          />
        ))}
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
                    <TableCell>₱{purchase.purchasePrice.toFixed(2)}</TableCell>
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
    </section>
  );
};

export default PurchasedCards;
