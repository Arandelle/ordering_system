import React from 'react';
import { DashboardStats } from '@/types/adminType';

interface DashboardCardsProps {
  stats: DashboardStats;
}

export default function DashboardCards({ stats }: DashboardCardsProps) {
  const cards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: '📦',
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      title: 'Total Revenue',
      value: `₱${stats.totalRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'from-emerald-500 to-teal-500',
      change: '+8.5%'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: '⏰',
      color: 'from-amber-500 to-orange-500',
      change: '+3'
    },
    {
      title: 'Best Seller',
      value: stats.bestSellingProduct,
      icon: '🏆',
      color: 'from-rose-500 to-pink-500',
      change: '247 sold'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {card.icon}
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              {card.change}
            </span>
          </div>
          
          <h3 className="text-stone-500 text-sm font-medium mb-2">{card.title}</h3>
          <p className="text-3xl font-bold text-stone-800">{card.value}</p>
        </div>
      ))}
    </div>
  );
}