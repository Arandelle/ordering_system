"use client";

import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const monthlyData = [
  { month: "Jan", revenue: 38500, orders: 142 },
  { month: "Feb", revenue: 45670, orders: 168 },
  { month: "Mar", revenue: 42300, orders: 155 },
  { month: "Apr", revenue: 51200, orders: 189 },
  { month: "May", revenue: 48900, orders: 176 },
  { month: "Jun", revenue: 55600, orders: 203 },
];

const categoryData = [
  { name: "Main Course", value: 48, color: "#f97316" },
  { name: "Desserts", value: 22, color: "#dc2626" },
  { name: "Extras", value: 18, color: "#eab308" },
  { name: "Soup", value: 12, color: "#78350f" },
];

const peakHours = [
  { hour: "9 AM", orders: 12 },
  { hour: "10 AM", orders: 18 },
  { hour: "11 AM", orders: 35 },
  { hour: "12 PM", orders: 52 },
  { hour: "1 PM", orders: 48 },
  { hour: "2 PM", orders: 28 },
  { hour: "3 PM", orders: 15 },
  { hour: "6 PM", orders: 42 },
  { hour: "7 PM", orders: 58 },
  { hour: "8 PM", orders: 45 },
];

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState("month");

  return (
    <section className="space-y-6">
      {/**Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">
            Reports & Analytics
          </h1>
          <p className="text-stone-500">
            Detailed insights into your business performance
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-6 py-3 rounded-xl border border-stone-200 bg-white font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="px-6 py-3 bg-[#ef4501] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-stone-100">
          <p className="text-sm text-stone-500 mb-2">Monthly Revenue</p>
          <p className="text-3xl font-bold text-stone-800">₱45,670</p>
          <p className="text-sm text-emerald-600 font-semibold mt-2">
            +15.3% from last month
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-stone-100">
          <p className="text-sm text-stone-500 mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-stone-800">168</p>
          <p className="text-sm text-emerald-600 font-semibold mt-2">
            +8.2% from last month
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-stone-100">
          <p className="text-sm text-stone-500 mb-2">Average Order Value</p>
          <p className="text-3xl font-bold text-stone-800">₱272</p>
          <p className="text-sm text-amber-600 font-semibold mt-2">
            -2.1% from last month
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-stone-100">
          <p className="text-sm text-stone-500 mb-2">Customer Retention</p>
          <p className="text-3xl font-bold text-stone-800">68%</p>
          <p className="text-sm text-emerald-600 font-semibold mt-2">
            +5.4% from last month
          </p>
        </div>
      </div>

      {/**Revenue & Orders Trend */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-stone-800">
            Revenue & Orders Trend
          </h3>
          <p className="text-sm text-stone-500 mt-1">
            Monthly performance over the last 6 months
          </p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              yAxisId="left"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "12px",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#f97316"
              strokeWidth={3}
              name="Revenue (₱)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#dc2626"
              strokeWidth={3}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/**Sales by Category & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/**Category Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-stone-800">
              Sales by Category
            </h3>
            <p className="text-sm text-stone-500 mt-1">
              Revenue distribution across menu categories
            </p>

            <ResponsiveContainer width={"100%"} height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-stone-800">
              Peak Hours Analysis
            </h3>
            <p className="text-sm text-stone-500 mt-1">
              Busiest hours of the day
            </p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="hour"
                stroke="#9ca3af"
                style={{ fontSize: "11px" }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px",
                }}
              />
              <Bar dataKey="orders" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default ReportsPage;
