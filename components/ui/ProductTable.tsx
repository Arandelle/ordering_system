import React from 'react';
import { Product } from '@/types/adminType';
import StatusBadge from './StatusBadge';

interface ProductTableProps {
  products: Product[];
}

export default function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-2xl overflow-hidden">
                      {product.isPopular ? '⭐' : '🍽️'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{product.name}</p>
                      <p className="text-xs text-stone-500 mt-1">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-stone-600">{product.category}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-stone-800">
                    ₱{product.price.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${
                    product.stock === 0 ? 'text-red-600' : 
                    product.stock < 20 ? 'text-amber-600' : 
                    'text-emerald-600'
                  }`}>
                    {product.stock} units
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={product.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <span className="text-lg">✏️</span>
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <span className="text-lg">🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}