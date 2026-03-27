"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface InventoryItem {
  id: string;
  image: string;
  name: string;
  price: number;
  stock: number;
  reorderLevel: number;
  category: string;
}

const InventoryTable = () => {
  // Static data for now
  const inventoryData: InventoryItem[] = [
    {
      id: "1",
      image: "https://via.placeholder.com/80?text=Fried+Chicken",
      name: "Fried Chicken Combo",
      price: 199,
      stock: 45,
      reorderLevel: 100,
      category: "Main Course",
    },
    {
      id: "2",
      image: "https://via.placeholder.com/80?text=Soda",
      name: "Soda",
      price: 45,
      stock: 200,
      reorderLevel: 150,
      category: "Beverages",
    },
    {
      id: "3",
      image: "https://via.placeholder.com/80?text=Wine",
      name: "Red Wine",
      price: 599,
      stock: 2,
      reorderLevel: 5,
      category: "Beverages",
    },
    {
      id: "4",
      image: "https://via.placeholder.com/80?text=Rice",
      name: "Rice",
      price: 89,
      stock: 0,
      reorderLevel: 50,
      category: "Staples",
    },
    {
      id: "5",
      image: "https://via.placeholder.com/80?text=Dessert",
      name: "Chocolate Cake",
      price: 149,
      stock: 15,
      reorderLevel: 20,
      category: "Desserts",
    },
  ];

  const inventoryHeader = ["Image", "Name", "Category", "Price", "Stock", "Status", "Action"];

  // Function to determine stock status
  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) {
      return {
        label: "Empty",
        className: "bg-red-50 text-red-700 border border-red-200",
      };
    }
    if (stock <= reorderLevel) {
      return {
        label: "Low Stock",
        className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      };
    }
    return {
      label: "In Stock",
      className: "bg-green-50 text-green-700 border border-green-200",
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            {inventoryHeader.map((item, index) => (
              <TableHead key={index} className="text-center font-semibold text-slate-700">
                {item}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {inventoryData.map((item) => {
            const status = getStockStatus(item.stock, item.reorderLevel);

            return (
              <TableRow key={item.id} className="hover:bg-slate-50 border-b border-slate-100">
                {/* Image */}
                <TableCell className="text-center py-3">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={item.image}
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
                  <span className="font-semibold text-slate-900">{item.stock}</span>
                  <span className="text-xs text-slate-500 block">
                    Reorder: {item.reorderLevel}
                  </span>
                </TableCell>

                {/* Status Badge */}
                <TableCell className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </TableCell>

                {/* Action */}
                <TableCell className="text-center">
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
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
    </div>
  );
};

export default InventoryTable;