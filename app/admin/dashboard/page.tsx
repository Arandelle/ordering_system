import React from 'react';
import DashboardCards from '@/components/admin/DashboardCard';
import SalesChart from '@/components/admin/SalesChart';
import OrdersTable from '@/components/OrdersTable';
import { mockDashboardStats, mockSalesData, mockTopProducts, mockOrders } from '@/data/mockData'

export default function DashboardPage() {
  const recentOrders = mockOrders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Dashboard Overview</h1>
        <p className="text-stone-500">Monitor your restaurant performance and operations</p>
      </div>

      {/* Stats Cards */}
      <DashboardCards stats={mockDashboardStats} />

      {/* Charts */}
      <SalesChart salesData={mockSalesData} topProducts={mockTopProducts} />

      {/* Recent Orders */}
      <OrdersTable orders={recentOrders} showActions={false} />
    </div>
  );
}