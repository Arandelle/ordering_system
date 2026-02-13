import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'preparing' | 'completed' | 'cancelled' | 'active' | 'inactive';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    preparing: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200'
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]} uppercase tracking-wide`}
    >
      {status}
    </span>
  );
}