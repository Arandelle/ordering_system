"use client";

import { InputField } from "@/components/ui/InputField";
import LoadingPage from "@/components/ui/LoadingPage";
import Modal from "@/components/ui/Modal";
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
} from "@/hooks/api/useBranchInventory";
import {
  InventoryItem,
  STOCK_STATUSES,
  StockStatus,
} from "@/types/inventory_types";
import { ChangeEvent, useState } from "react";

const InventoryTable = () => {
  const { data: inventoryData = [], isPending } = useBranchInventories();
  const {
    mutate: updateInventory,
    isPending: isUpdating,
    isError,
    error,
  } = useUpdateInventory();

  const inventoryHeader = [
    "Image",
    "Name",
    "Category",
    "Price",
    "Stock",
    "Status",
    "Action",
  ];

  const [isEditStock, setIsEditStock] = useState(false);
  const [inventoryStocks, setInventoryStocks] = useState({
    quantity: 0,
    reorderLevel: 0,
  });

  const [productToEdit, setProductToEdit] = useState<InventoryItem | null>(
    null,
  );

  // Function to determine stock status
  const getStockStatus = (status: StockStatus) => {
    if (status === STOCK_STATUSES.OUT_OF_STOCK) {
      return {
        label: "Empty",
        className: "bg-red-50 text-red-700 border border-red-200",
      };
    }
    if (status === STOCK_STATUSES.LOW_STOCK) {
      return {
        label: "Low Stock",
        className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      };
    }

    if (status === STOCK_STATUSES.IN_STOCK) {
      return {
        label: "In Stock",
        className: "bg-green-50 text-green-700 border border-green-200",
      };
    }
    return {
      label: "Not defined - Check response status",
      className: "bg-slate-50 text-slate-700 border border-slate-200",
    };
  };

  const handleProductToEdit = (product: InventoryItem) => {
    setInventoryStocks({
      quantity: product.quantity,
      reorderLevel: product.reorderLevel,
    });
    setProductToEdit(product);
    setIsEditStock(!isEditStock);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInventoryStocks((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSave = () => {
    if (!productToEdit) return;

    updateInventory(
      {
        id: productToEdit.id,
        payload: {
          quantity: inventoryStocks.quantity,
          reorderLevel: inventoryStocks.reorderLevel,
        },
      },
      {
        onSuccess: () => setIsEditStock(false),
      },
    );
  };

  if (isPending) {
    return <LoadingPage />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            {inventoryHeader.map((item, index) => (
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
          {inventoryData.map((item) => {
            const status = getStockStatus(item.status);

            return (
              <TableRow
                key={item.id}
                className="hover:bg-slate-50 border-b border-slate-100"
              >
                {/* Image */}
                <TableCell className="text-center py-3">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={item.image.url}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </TableCell>

                {/* Name */}
                <TableCell className="font-medium text-slate-900">
                  {item.name}
                </TableCell>

                {/* Category */}
                <TableCell className="text-sm text-slate-600">
                  {item.category}
                </TableCell>

                {/* Price */}
                <TableCell className="text-center text-slate-900 font-medium">
                  ₱{item.price}
                </TableCell>

                {/* Stock */}
                <TableCell className="text-center">
                  <span className="font-semibold text-slate-900">
                    {item.quantity}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    Reorder: {item.reorderLevel}
                  </span>
                </TableCell>

                {/* Status Badge */}
                <TableCell className="text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </TableCell>

                {/* Action */}
                <TableCell className="text-center">
                  <button
                    onClick={() => handleProductToEdit(item)}
                    className="px-4 py-2 text-sm font-medium text-brand-color-600 hover:bg-brand-color-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Empty state (optional) */}
      {inventoryData.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          <p>No inventory items found</p>
        </div>
      )}

      {isEditStock && productToEdit && (
        <Modal
          title={`Update Stock for  ${productToEdit?.name} `}
          subTitle={`Keep your products available`}
          onClose={() => setIsEditStock(false)}
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
              autoFocus
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
              <button
                onClick={() => setIsEditStock(false)}
                type="button"
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isUpdating}
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-brand-color-500 hover:bg-brand-color-600 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isUpdating ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InventoryTable;
