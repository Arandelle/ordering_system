import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, Users, Wallet } from "lucide-react";
import React from "react";

const mockCustomers = [
  {
    id: "C001",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "+63 912 345 6789",
    totalOrders: 23,
    totalSpent: 8750,
    joinDate: "2024-01-15",
  },
  {
    id: "C002",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    phone: "+63 923 456 7890",
    totalOrders: 15,
    totalSpent: 5420,
    joinDate: "2024-02-01",
  },
  {
    id: "C003",
    name: "Anna Reyes",
    email: "anna.reyes@email.com",
    phone: "+63 934 567 8901",
    totalOrders: 31,
    totalSpent: 12350,
    joinDate: "2023-12-10",
  },
  {
    id: "C004",
    name: "Carlos Rivera",
    email: "carlos.rivera@email.com",
    phone: "+63 945 678 9012",
    totalOrders: 8,
    totalSpent: 2890,
    joinDate: "2024-02-05",
  },
];

const CustomersPage = () => {
  const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const average = totalRevenue / mockCustomers.length;

  const customerHeaders = [
    "Customer",
    "Contact",
    "Total Orders",
    "Total Spent",
    "Join Date",
    "Actions",
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Customers</h1>
        <p className="text-stone-500">View and manage customer information</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-2xl">
              <Users />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Customers</p>
              <p className="text-2xl font-bold text-stone-800">
                {mockCustomers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-2xl">
              <Star />
            </div>
            <div>
              <p className="text-sm text-stone-500">VIP Customers</p>
              <p className="text-2xl font-bold text-stone-800">
                {mockCustomers.filter((c) => c.totalSpent > 10000).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ef4501] text-white flex items-center justify-center text-2xl">
              <Wallet />
            </div>
            <div>
              <p className="text-sm text-stone-500">Average Customer Value</p>
              <p className="text-2xl font-bold text-stone-800">
                ₱{average.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {customerHeaders.map((head, index) => (
                  <TableHead
                    key={index}
                    className="tex-xs font-semibold uppercase tracking-wider"
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-stone-100">
              {mockCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="hover:bg-stone-50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-stone-800">
                          {customer.name}
                        </p>
                        <p className="text-xs text-stone-500">{customer.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-stone-700">{customer.email}</p>
                      <p className="text-xs text-stone-500 mt-1">
                        {customer.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold text-stone-800">
                      {customer.totalOrders}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold text-emerald-600">
                      ₱{customer.totalSpent.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-stone-600">
                      {new Date(customer.joinDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button className="px-4 py-2 text-sm font-semibold text-[#ef4501] hover:bg-[#ef4501]/20 rounded-lg transition-colors cursor-pointer">
                      View Details
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default CustomersPage;
