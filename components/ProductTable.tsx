import React from "react";
import { Product } from "@/types/adminType";
import StatusBadge from "./ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Pencil, PencilLine, Trash, Trash2 } from "lucide-react";

interface ProductTableProps {
  products: Product[];
}

export default function ProductTable({ products }: ProductTableProps) {
  const productHeaders = [
    "Product",
    "Category",
    "Price",
    "Stock",
    "Status",
    "Actions",
  ];

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
                key={product.id}
                className="hover:bg-stone-50 transition-colors"
              >
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
                    {product.stock} units
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <StatusBadge status={product.status} />
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-emerald-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <PencilLine />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 />
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
