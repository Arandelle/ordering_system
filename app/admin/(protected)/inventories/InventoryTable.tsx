"use client";

import { InputField } from "@/components/ui/FormComponents/InputField";
import LoadingPage from "@/components/ui/LoadingPage";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useBranchInventories,
  useUpdateInventory,
  useBulkUpdateInventory,
  InventoryQueryParams,
} from "@/hooks/api/useBranchInventory";
import {
  InventoryItem,
  STOCK_STATUSES,
  StockStatus,
} from "@/types/inventory_types";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import InventorySummaryCards from "./InventorySummaryCards";
import { useAdminBranchContext } from "@/contexts/AdminBranchContext";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import {
  Checkbox,
  SelectField,
  ToggleButton,
} from "@/components/ui/FormComponents";
import { IconButton } from "@/components/ui/buttons";
import { AppImage } from "@/components/AppImage";

// ── Sort options available in the toolbar ─────────────────────────────────────
const SORT_OPTIONS = [
  { value: "name:asc", label: "Name (A–Z)" },
  { value: "name:desc", label: "Name (Z–A)" },
  { value: "price:asc", label: "Price (Low → High)" },
  { value: "price:desc", label: "Price (High → Low)" },
  { value: "quantity:asc", label: "Stock (Low → High)" },
  { value: "quantity:desc", label: "Stock (High → Low)" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: STOCK_STATUSES.IN_STOCK, label: "In Stock" },
  { value: STOCK_STATUSES.LOW_STOCK, label: "Low Stock" },
  { value: STOCK_STATUSES.OUT_OF_STOCK, label: "Out of Stock" },
];

const InventoryTable = () => {
  const { selectedBranchId } = useAdminBranchContext();

  const isAllBranches = selectedBranchId === "all";

  // ── Query params (search, filter, sort, pagination) ───────────────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("quantity:asc");

  // Debounce search input so we don't fire a request on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handleSort = useCallback((value: string) => {
    setSort(value);
    setPage(1);
  }, []);

  // Build query params for the hook
  const queryParams: InventoryQueryParams = {
    page,
    limit,
    sort,
    ...(selectedBranchId && selectedBranchId !== "all"
      ? { branchId: selectedBranchId }
      : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { data, isPending } = useBranchInventories(
    selectedBranchId ? queryParams : undefined,
  );

  const inventoryData = data?.data ?? [];
  const pagination = data?.pagination;
  const counts = data?.counts ?? {
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    total: 0,
  };

  const {
    mutate: updateInventory,
    isPending: isUpdating,
    isError,
    error,
  } = useUpdateInventory();
  const {
    mutate: bulkUpdate,
    isPending: isBulkUpdating,
    isError: isBulkError,
    error: bulkError,
  } = useBulkUpdateInventory();

  const inventoryHeader = [
    "Image",
    "Name",
    "Category",
    "Price",
    "Stock",
    "Pending Order",
    "Sellable",
    "Status",
    ...(isAllBranches ? ["Branch"] : []),
    "Action",
  ];

  // ── Single edit state ─────────────────────────────────────────────────────
  const [isEditStock, setIsEditStock] = useState(false);
  const [inventoryStocks, setInventoryStocks] = useState({
    quantity: 0,
    reorderLevel: 0,
  });
  const [productToEdit, setProductToEdit] = useState<InventoryItem | null>(
    null,
  );

  // ── Bulk edit state ───────────────────────────────────────────────────────
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkValues, setBulkValues] = useState({
    quantity: 0,
    applyReorderLevel: false,
    reorderLevel: 0,
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getStockStatus = (status: StockStatus) => {
    if (status === STOCK_STATUSES.OUT_OF_STOCK)
      return {
        label: "Empty",
        className: "bg-red-50 text-red-700 border border-red-200",
      };
    if (status === STOCK_STATUSES.LOW_STOCK)
      return {
        label: "Low Stock",
        className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      };
    if (status === STOCK_STATUSES.IN_STOCK)
      return {
        label: "In Stock",
        className: "bg-green-50 text-green-700 border border-green-200",
      };
    return {
      label: "Unknown",
      className: "bg-slate-50 text-slate-700 border border-slate-200",
    };
  };

  // ── Single edit handlers ──────────────────────────────────────────────────

  const handleProductToEdit = (product: InventoryItem) => {
    setInventoryStocks({
      quantity: product.quantity,
      reorderLevel: product.reorderLevel,
    });
    setProductToEdit(product);
    setIsEditStock(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInventoryStocks((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToEdit) return;
    updateInventory(
      {
        id: productToEdit.id,
        payload: inventoryStocks,
        branchId: selectedBranchId !== "all" ? selectedBranchId : undefined,
      },
      { onSuccess: () => setIsEditStock(false) },
    );
  };

  // ── Bulk edit handlers ────────────────────────────────────────────────────

  const enterBulkMode = () => {
    setIsBulkMode(true);
    setSelectedIds(new Set());
  };

  const exitBulkMode = () => {
    setIsBulkMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === inventoryData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(inventoryData.map((i) => i.id)));
    }
  };

  const openBulkModal = () => {
    setBulkValues({ quantity: 0, applyReorderLevel: false, reorderLevel: 0 });
    setIsBulkModalOpen(true);
  };

  const handleBulkChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setBulkValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const handleBulkToggleChange =
    (name: keyof typeof bulkValues) => (value: boolean) => {
      setBulkValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

  const handleBulkSave = (e: React.FormEvent) => {
    e.preventDefault();

    const items = Array.from(selectedIds).map((id) => ({
      productId: id,
      quantity: bulkValues.quantity,
      ...(bulkValues.applyReorderLevel && {
        reorderLevel: bulkValues.reorderLevel,
      }),
    }));

    bulkUpdate(
      {
        items,
        branchId: selectedBranchId !== "all" ? selectedBranchId : undefined,
      },
      {
        onSuccess: () => {
          setIsBulkModalOpen(false);
          exitBulkMode();
        },
      },
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (!selectedBranchId && isPending) return <LoadingPage />;

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <InventorySummaryCards counts={counts} />

      {/* Toolbar: branch selector, search, filters, sort */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="flex gap-2 w-full max-w-lg">
            <SelectField
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              options={[
                ...STATUS_OPTIONS.map((s) => ({
                  label: s.label,
                  value: s.value,
                })),
              ]}
            />
            <SelectField
              value={sort}
              onChange={(e) => handleSort(e.target.value)}
              options={[
                ...SORT_OPTIONS.map((s) => ({
                  label: s.label,
                  value: s.value,
                })),
              ]}
            />
          </div>
          {/* Search */}
          <InputField
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            rightElement={<DynamicIcon name="Search" />}
          />

          {/* Sub-toolbar: item count + bulk actions */}

          <div className="flex items-stretch whitespace-nowrap  gap-2">
            {isBulkMode ? (
              <>
                <IconButton
                  type="button"
                  onClick={exitBulkMode}
                  disabled={isBulkUpdating}
                  variant="secondary"
                  text="Cancel"
                  className="rounded-lg px-4"
                />
                <IconButton
                  type="button"
                  onClick={openBulkModal}
                  disabled={selectedIds.size === 0}
                  text={`Save (${selectedIds.size})`}
                  className="rounded-lg px-4"
                />
              </>
            ) : (
              <IconButton
                type="button"
                onClick={enterBulkMode}
                disabled={isAllBranches}
                title={
                  isAllBranches
                    ? "Bulk edit is not available in All Branches view — select a specific branch"
                    : undefined
                }
                text="Edit Bulk"
                variant={isAllBranches ? "disabled" : "primary"}
                className="rounded-lg px-4"
              />
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-[65vh]">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {isBulkMode && !isAllBranches && (
                  <TableHead className="w-10 text-center">
                    <Checkbox
                      type="checkbox"
                      checked={
                        selectedIds.size === inventoryData.length &&
                        inventoryData.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                )}
                {inventoryHeader
                  .filter((h) => !(isBulkMode && h === "Action"))
                  .map((item, index) => (
                    <TableHead
                      key={index}
                      className="text-center font-semibold text-slate-700"
                    >
                      {item}
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell
                    colSpan={inventoryHeader.length + (isBulkMode ? 1 : 0)}
                    className="text-center py-12 text-slate-400"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : inventoryData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={inventoryHeader.length + (isBulkMode ? 1 : 0)}
                    className="text-center py-12 text-slate-500"
                  >
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                inventoryData.map((item, index) => {
                  const status = getStockStatus(item.status as StockStatus);
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <TableRow
                      key={`${item.id}-${index}`}
                      onClick={() => isBulkMode && toggleSelect(item.id)}
                      className={`border-b border-slate-100 transition-colors ${
                        isBulkMode
                          ? isSelected
                            ? "bg-brand-color-50 cursor-pointer"
                            : "hover:bg-slate-50 cursor-pointer"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {isBulkMode && !isAllBranches && (
                        <TableCell
                          className="text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-center py-3">
                        <div className="flex justify-center">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                            <AppImage src={item.image.url} alt={item.name} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {item.category}
                      </TableCell>
                      <TableCell className="text-center text-slate-900 font-medium">
                        ₱{item.price}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          Reorder: {item.reorderLevel}
                        </span>
                      </TableCell>

                      {/* Incoming Orders — amber, draws attention */}
                      <TableCell className="text-center">
                        {(item.reserved || 0) > 0 ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-sm">
                            <span>⏳</span>
                            {item.reserved}
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-400">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Sellable — green/amber/red based on level */}
                      <TableCell className="text-center">
                        {item.available === 0 ? (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-red-600">
                            <span>✕</span> 0
                          </span>
                        ) : (item.available || 0) <= item.reorderLevel ? (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-amber-600">
                            <span>⚠️</span>
                            {item.available}
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-green-600">
                            <span>✓</span>
                            {item.available}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </TableCell>
                      {/* Branch column — only visible when viewing all branches */}
                      {isAllBranches && (
                        <TableCell className="text-center">
                          {item.branch ? (
                            <div className="flex flex-col items-center">
                              <span
                                style={{ fontFamily: "'DM Mono', monospace" }}
                                className="text-xs bg-gray-500 py-0.5 px-2 rounded-md text-white"
                              >
                                {item.branch.code}
                              </span>
                              <span className="text-xs text-gray-600 mt-0.5">
                                {item.branch.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">All</span>
                          )}
                        </TableCell>
                      )}
                      {!isBulkMode && (
                        <TableCell className="text-center">
                          <IconButton
                            type="button"
                            onClick={() => handleProductToEdit(item)}
                            text="Edit"
                            variant="underline"
                            className="text-blue-500 hover:text-blue-600"
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}

      {/* Single edit modal */}
      {isEditStock && productToEdit && (
        <Modal
          title={`Update Stock for ${productToEdit.name}`}
          subTitle="Keep your products available"
          onClose={() => !isUpdating && setIsEditStock(false)}
        >
          <form className="space-y-4" onSubmit={handleSave}>
            <InputField
              label="Quantity"
              placeholder="Enter stock/quantity"
              type="number"
              name="quantity"
              value={inventoryStocks.quantity}
              onChange={handleChange}
              required
            />
            <InputField
              label="Reorder Alert Level"
              placeholder="Enter reorder alert"
              type="number"
              name="reorderLevel"
              value={inventoryStocks.reorderLevel}
              onChange={handleChange}
              required
            />
            {isError && (
              <p className="text-sm text-red-600">
                {error?.message ?? "Something went wrong. Please try again."}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <IconButton
                type="button"
                onClick={() => setIsEditStock(false)}
                disabled={isUpdating}
                variant="secondary"
                text="Cancel"
                className="px-4 rounded-lg"
              />

              <IconButton
                type="submit"
                disabled={isUpdating}
                text={isUpdating ? "Saving..." : "Save Changes"}
                className="px-4 rounded-lg"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk edit modal */}
      {isBulkModalOpen && (
        <Modal
          title={`Bulk Update Stock`}
          subTitle={`Applying to ${selectedIds.size} selected product${selectedIds.size > 1 ? "s" : ""}`}
          onClose={() => !isBulkUpdating && setIsBulkModalOpen(false)}
        >
          <form className="space-y-4" onSubmit={handleBulkSave}>
            <InputField
              label="Quantity"
              placeholder="Enter quantity for all selected"
              type="number"
              name="quantity"
              value={bulkValues.quantity}
              onChange={handleBulkChange}
              required
            />

            {/* Reorder level toggle */}
            <div className="flex items-center gap-2">
              <ToggleButton
                id="applyReorderLevel"
                name="applyReorderLevel"
                checked={bulkValues.applyReorderLevel}
                onCheckedChange={handleBulkToggleChange("applyReorderLevel")}
                label="Apply same reorder level to all"
              />
            </div>

            {bulkValues.applyReorderLevel && (
              <InputField
                label="Reorder Alert Level"
                placeholder="Enter reorder level for all selected"
                type="number"
                name="reorderLevel"
                value={bulkValues.reorderLevel}
                onChange={handleBulkChange}
                required
              />
            )}

            {isBulkError && (
              <p className="text-sm text-red-600">
                {bulkError?.message ??
                  "Something went wrong. Please try again."}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <IconButton
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                disabled={isBulkUpdating}
                variant="secondary"
                text="Cancel"
                className="rounded-lg px-4"
              />

              <IconButton
                type="submit"
                disabled={isBulkUpdating}
                text={
                  isBulkUpdating
                    ? "Saving..."
                    : `Update ${selectedIds.size} item${selectedIds.size > 1 ? "s" : ""}`
                }
                className="px-4 rounded-lg"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InventoryTable;
