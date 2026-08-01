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
} from "../../../components/ui/table";
import { useDeleteProduct } from "@/hooks/api/useProducts";
import PermissionGuard from "@/lib/PermissionGuard";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Product } from "@/types/products";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppImage } from "@/components/AppImage";
import { ProductBadgeRibbon } from "@/app/customer/helper/getProductBadges";
import { IconButton } from "@/components/ui/buttons";
import { FetchError } from "@/components/ui/FetchError";
import { SearchBar } from "@/components/ui/SearchBar";
import { SelectField, Checkbox } from "@/components/ui/FormComponents";
import { useStaffContext } from "@/contexts/StaffContext";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import BulkEditModal from "./BulkEditModal";

// ─── Filter & sort option constants ──────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "coming-soon", label: "Coming Soon" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "solo", label: "Solo" },
  { value: "combo", label: "Combo" },
  { value: "set", label: "Set" },
];

const POPULARITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "popular", label: "Popular" },
  { value: "not-popular", label: "Not Popular" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Status (default)" },
  { value: "price:asc", label: "Price: Low → High" },
  { value: "price:desc", label: "Price: High → Low" },
  { value: "name:asc", label: "Name: A → Z" },
  { value: "name:desc", label: "Name: Z → A" },
];

interface ProductTableProps {
  products: Product[];
  isProductLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry?: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  popularityFilter: string;
  onPopularityFilterChange: (value: string) => void;
  sortOption: string;
  onSortOptionChange: (value: string) => void;
  onResetFilters: () => void;
}

/**
 * Admin product table with loading skeleton, error recovery, and empty state.
 * Includes server-side filtering (status, type, popularity) and sorting (price, name, status).
 */
export default function ProductTable({
  products,
  isProductLoading,
  isError,
  error,
  onRetry,
  searchQuery,
  onSearchChange,
  onSearch,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  popularityFilter,
  onPopularityFilterChange,
  sortOption,
  onSortOptionChange,
  onResetFilters,
}: ProductTableProps) {
  const router = useRouter();
  const admin = useStaffContext();

  const hasActiveFilters =
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    popularityFilter !== "all" ||
    sortOption !== "default" ||
    searchQuery !== "";

  const productHeaders = [
    "Select",
    "Image",
    "Product",
    "Type",
    "Status",
    "Category",
    "Price",
    "Pax",
    "Actions",
  ];

  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );

  // ── Bulk selection state ──────────────────────────────────────────────────
  const [bulkEdit, setBulkEdit] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  const canUpdate = admin && canAccess(admin.role, "products.update");

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p._id)));
    }
  };

  const isAllSelected =
    products.length > 0 && selectedIds.size === products.length;
  const isSomeSelected =
    selectedIds.size > 0 && selectedIds.size < products.length;

  const deleteMutation = useDeleteProduct();

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      setDeletingProductId(id);
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="All Products"
          subtitle={`${products.length} product${products.length !== 1 ? "s" : ""} found`}
          actions={
            <div className="flex gap-4">
              <IconButton
                onClick={() => router.push("/products/new")}
                disabled={!admin || !canAccess(admin.role, "products.create")}
                icon={{ name: "Plus" }}
                text="Add Product"
                className="py-3 px-4"
              />

              <IconButton
                onClick={() => {
                  setBulkEdit((prev) => !prev);
                  setSelectedIds(new Set());
                }}
                icon={{ name: bulkEdit ? "Ban" : "Pencil" }}
                text={bulkEdit ? "Cancel Edit" : "Edit Bulk"}
                variant={bulkEdit ? "secondary" : "success"}
                className="py-3 px-4"
              />

              {selectedIds.size > 0 && canUpdate && (
                <div className="flex gap-4">
                  <IconButton
                    onClick={() => setSelectedIds(new Set())}
                    variant="danger"
                    icon={{ name: "X", size: 14 }}
                    text="Clear"
                    className="py-3 px-4"
                  />
                  <IconButton
                    onClick={() => setShowBulkEdit(true)}
                    variant="success"
                    icon={{ name: "PencilLine", size: 14 }}
                    text={`Bulk Edit (${selectedIds.size})`}
                    className="py-2 px-4"
                  />
                </div>
              )}
            </div>
          }
        />
        <TableToolbar className="flex-wrap">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onSearch={onSearch}
            placeholder="Search product by name, price, type"
          />
          <div className="flex items-end gap-3 flex-1 min-w-0">
            <SelectField
              label="Status"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              options={STATUS_OPTIONS}
            />
            <SelectField
              label="Type"
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              options={TYPE_OPTIONS}
            />
            <SelectField
              label="Popularity"
              value={popularityFilter}
              onChange={(e) => onPopularityFilterChange(e.target.value)}
              options={POPULARITY_OPTIONS}
            />
            <SelectField
              label="Sort by"
              value={sortOption}
              onChange={(e) => onSortOptionChange(e.target.value)}
              options={SORT_OPTIONS}
            />
          </div>
          {hasActiveFilters && (
            <IconButton
              onClick={onResetFilters}
              variant="ghost"
              className="text-slate-500 hover:text-red-500 hover:bg-red-50 self-end mb-0.5"
              icon={{ name: "RotateCcw", size: 14 }}
              text="Reset"
              title="Clear all filters and sort"
            />
          )}
        </TableToolbar>
        {isProductLoading ? (
          <TableSkeleton columns={productHeaders.length} rows={10} />
        ) : isError ? (
          <FetchError
            error={
              error instanceof Error
                ? error
                : new Error("We couldn't load these products")
            }
            onRetry={onRetry ?? (() => {})}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {/* Select-all checkbox */}
                {bulkEdit && (
                  <TableHead className="w-10 text-center">
                    {canUpdate && products.length > 0 && (
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isSomeSelected}
                        onChange={toggleSelectAll}
                        aria-label="Select all products"
                      />
                    )}
                  </TableHead>
                )}

                {productHeaders.slice(1).map((head, index) => (
                  <TableHead
                    key={index}
                    className="font-semibold uppercase tracking-wider text-center"
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow
                    key={product._id}
                    className={`hover:bg-slate-50 transition-colors ${product.isActive === false ? "opacity-50" : ""} ${selectedIds.has(product._id) ? "bg-brand-color-50/40" : ""}`}
                  >
                    {/* SELECT CHECKBOX */}
                    {bulkEdit && (
                      <TableCell className="w-10 px-3 py-4 text-center">
                        {canUpdate && (
                          <Checkbox
                            checked={selectedIds.has(product._id)}
                            onChange={() => toggleSelect(product._id)}
                            aria-label={`Select ${product.name}`}
                          />
                        )}
                      </TableCell>
                    )}

                    {/* IMAGE */}
                    <TableCell className="px-6 py-4 flex items-center justify-center relative">
                      {product.isPopular && (
                        <div className="absolute z-40 top-0 left-0">
                          <ProductBadgeRibbon
                            badge={{
                              label: "Popular",
                              bg: "bg-orange-500",
                              icon: "Flame",
                            }}
                          />
                        </div>
                      )}

                      <div className="relative w-18 h-18">
                        <div className="w-18 h-18 object-cover rounded-md">
                          <AppImage
                            src={
                              product?.image?.url || "/images/harrison_logo.png"
                            }
                            alt={product.name}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* NAME + INCLUDED ITEMS */}
                    <TableCell className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {product.name}
                      </p>

                      {product.productType !== "solo" &&
                        product.modifierGroups?.length > 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            {product.modifierGroups.length} groups ·{" "}
                            {product.modifierGroups.reduce(
                              (sum, g) => sum + (g.items?.length ?? 0),
                              0,
                            )}{" "}
                            items
                          </p>
                        )}
                    </TableCell>

                    {/* TYPE */}
                    <TableCell className="px-6 py-4 text-center">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 uppercase">
                        {product.productType || "No Product Type"}
                      </span>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {product.isActive === false ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 uppercase">
                            Inactive
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600 uppercase">
                            Active
                          </span>
                        )}
                        {product.isComingSoon && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 uppercase">
                            Coming Soon
                          </span>
                        )}
                        {product.isOnlineExclusive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 uppercase">
                            Online Exclusive
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* CATEGORY */}
                    <TableCell className="px-6 py-4">
                      <p className="flex flex-col">
                        <span className=" capitalize text-slate-900 font-bold">
                          {product.category?.name}
                        </span>
                        <span className="text-sm text-slate-600">
                          {product.subcategory?.name ?? "No Subcategory"}
                        </span>
                      </p>
                    </TableCell>

                    {/* PRICE */}
                    <TableCell className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800">
                        {product.price !== null
                          ? `₱${product.price.toFixed(2)}`
                          : "Varies"}
                      </span>
                    </TableCell>

                    {/* PAX */}
                    <TableCell className="px-6 py-4 text-center">
                      <span className="text-sm text-slate-600">
                        {product.paxCount ? `${product.paxCount} pax` : "-"}
                      </span>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell className="px-6 py-4">
                      {deleteMutation.isPending &&
                      deletingProductId === product._id ? (
                        <div className="flex items-center justify-center">
                          <DynamicIcon
                            name="Loader2"
                            size={16}
                            className="animate-spin text-gray-400"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <IconButton
                            onClick={() =>
                              router.push(`/products/view/${product._id}`)
                            }
                            variant="ghost"
                            className="text-blue-600 hover:bg-blue-50"
                            icon={{ name: "Eye", size: 16 }}
                            title="View details"
                          />
                          {/* Block individual edit/delete while bulk editing is active */}
                          {bulkEdit ? (
                            <span className="text-[10px] text-gray-400 font-medium">
                              Use bulk edit
                            </span>
                          ) : (
                            <>
                              <PermissionGuard
                                permission="products.update"
                                fallback={
                                  <span className="text-xs text-gray-400">
                                    No access on buttons
                                  </span>
                                }
                              >
                                <IconButton
                                  onClick={() =>
                                    router.push(
                                      `/products/${product._id}/edit`,
                                    )
                                  }
                                  disabled={
                                    deletingProductId === product._id
                                  }
                                  variant="ghost"
                                  className="text-emerald-600 hover:bg-emerald-50"
                                  icon={{ name: "PencilLine", size: 16 }}
                                />
                              </PermissionGuard>
                              <PermissionGuard permission="products.delete">
                                <IconButton
                                  onClick={() =>
                                    handleDeleteItem(product._id)
                                  }
                                  disabled={
                                    deletingProductId === product._id
                                  }
                                  variant="ghost"
                                  className="text-red-600 hover:bg-red-50"
                                  icon={{ name: "Trash2", size: 16 }}
                                />
                              </PermissionGuard>
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={productHeaders.length}>
                    <TableEmptyState
                      title="No Products Found"
                      description="Try refreshing the page or use the search bar"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableCard>

      {/* ── Bulk Edit Modal ───────────────────────────────────────────── */}
      {showBulkEdit && (
        <BulkEditModal
          selectedIds={Array.from(selectedIds)}
          onClose={() => {
            setShowBulkEdit(false);
            setBulkEdit(false)
            setSelectedIds(new Set())
          }}
        />
      )}
    </>
  );
}
