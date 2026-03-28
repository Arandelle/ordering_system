import React from 'react';

export default function Header() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Welcome back, Admin</h2>
        <p className="text-sm text-stone-500 mt-1">{currentDate}</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-3 rounded-xl hover:bg-stone-100 transition-colors">
          <span className="text-xl">🔔</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-stone-800">Admin User</p>
            <p className="text-xs text-stone-500">Restaurant Manager</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}