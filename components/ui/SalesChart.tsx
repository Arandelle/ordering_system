'use client';

import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SalesData, TopProduct } from '@/types/adminType';

interface SalesChartProps {
  salesData: SalesData[];
  topProducts: TopProduct[];
}

export default function SalesChart({ salesData, topProducts }: SalesChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sales Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-stone-800">Sales Overview</h3>
            <p className="text-sm text-stone-500 mt-1">Weekly revenue trend</p>
          </div>
          <select className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>
        
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#f97316" 
              strokeWidth={3}
              dot={{ fill: '#dc2626', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-stone-800">Top Selling Products</h3>
          <p className="text-sm text-stone-500 mt-1">Best performers this month</p>
        </div>
        
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topProducts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px'
              }}
            />
            <Bar 
              dataKey="sales" 
              fill="url(#colorGradient)"
              radius={[12, 12, 0, 0]}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}