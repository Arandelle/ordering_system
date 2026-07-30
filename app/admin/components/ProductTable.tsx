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
import { useStaffContext } from "@/contexts/StaffContext";
import { canAccess } from "@/lib/roleBasedAccessCtrl";

interface ProductTableProps {
  products: Product[];
  isProductLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry?: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

/**
 * Admin product table with loading skeleton, error recovery, and empty state.
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
}: ProductTableProps) {
  const router = useRouter();
  const admin = useStaffContext();

  const productHeaders = [
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
    <TableCard>
      <TableCardHeader
        title="All Products"
        subtitle={`${products.length} product${products.length !== 1 ? "s" : ""} found`}
        actions={
          <div>
            <IconButton
              onClick={() => router.push("/products/new")}
              disabled={!admin || !canAccess(admin.role, "products.create")}
              icon={{ name: "Plus" }}
              text="Add Product"
              className="py-3 px-4 rounded-xl"
            />
          </div>
        }
      />
      <TableToolbar>
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onSearch={onSearch}
          placeholder="Search product by name, price, type"
        />
      </TableToolbar>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {productHeaders.map((head, index) => (
                <TableHead
                  key={index}
                  className="font-semibold uppercase tracking-wider text-center"
                >
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {isProductLoading ? (
            <TableSkeleton columns={productHeaders.length} rows={10} />
          ) : isError ? (
            <TableBody className="divide-y divide-slate-100">
              <TableRow>
                <TableCell colSpan={productHeaders.length}>
                  <FetchError
                    error={
                      error instanceof Error
                        ? error
                        : new Error("We couldn't load these products")
                    }
                    onRetry={onRetry ?? (() => {})}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody className="divide-y divide-slate-100">
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow
                    key={product._id}
                    className={`hover:bg-slate-50 transition-colors ${product.isActive === false ? "opacity-50" : ""}`}
                  >
                    {/* IMAGE */}
                    <TableCell className="px-6 py-4 flex items-center justify-center relative">
                      {product.isPopular && (
                        <div className="absolute z-50 top-0 left-0">
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
                                router.push(`/products/${product._id}/edit`)
                              }
                              disabled={deletingProductId === product._id}
                              variant="ghost"
                              className="text-emerald-600 hover:bg-emerald-50"
                              icon={{ name: "PencilLine", size: 16 }}
                            />
                          </PermissionGuard>
                          <PermissionGuard permission="products.delete">
                            <IconButton
                              onClick={() => handleDeleteItem(product._id)}
                              disabled={deletingProductId === product._id}
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50"
                              icon={{ name: "Trash2", size: 16 }}
                            />
                          </PermissionGuard>
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
          )}
        </Table>
      </div>
    </TableCard>
  );
}
