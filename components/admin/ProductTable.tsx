import React from "react";
import { Product } from "@/types/adminType";
import StatusBadge from "../ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { PencilLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProductTableProps {
  products: Product[];
}

export default function ProductTable({ products }: ProductTableProps) {
  const productHeaders = [
    "Image",
    "Product",
    "Category",
    "Price",
    "Stock",
    "Actions",
  ];

  const handleDeleteItem = async (id: string) => {
    if (!id) return;
    try {
      const response = await fetch(`api/products/${id}/`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Deleted Successfully!");
      }
    } catch (error) {
      console.error("Error Deleting an item", error);
      toast.error("Error deleting an Item");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {productHeaders.map((head, index) => (
                <TableHead
                  key={index}
                  className="font-semibold uppercase tracking-wider"
                >
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-stone-100">
            {products.map((product) => (
              <TableRow
                key={product._id}
                className="hover:bg-stone-50 transition-colors"
              >
                <TableCell className="px-6 py-4 flex items-center justify-center">
                  <div>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24"
                    />
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      {product.name}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      {product.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-sm text-stone-600">
                    {product.category}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-sm font-semibold text-stone-800">
                    ₱{product.price.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className={`text-sm font-medium ${
                      product.stock === 0
                        ? "text-red-600"
                        : product.stock < 20
                          ? "text-amber-600"
                          : "text-emerald-600"
                    }`}
                  >
                    {product.stock} left
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-emerald-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <PencilLine size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(product._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
