'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import { 
  LayoutDashboard, UtensilsCrossed, ShoppingBag, Settings, Bell, Search, 
  MoreVertical, CheckCircle, Clock, Package, DollarSign, TrendingUp, Menu, X,
  Users, Plus, Edit, Trash2, Save, XCircle, Eye, Mail, Phone, MapPin, Calendar,
  Filter, Download, RefreshCw, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- LocalStorage Utils ---

const STORAGE_KEYS = {
  ORDERS: 'harrison_orders',
  PRODUCTS: 'harrison_products',
  CUSTOMERS: 'harrison_customers',
  SETTINGS: 'harrison_settings'
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
};

// --- Initial Data ---

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Harrison's Signature Ribs",
    price: 24.99,
    category: "BBQ Specials",
    status: "Active",
    stock: 45,
    image: "https://image.qwenlm.ai/public_source/e8b5c795-56c3-4a48-afa8-1f26e4d9a353/134c6431f-9a94-41e1-92c0-df45f302bd86.png"
  },
  {
    id: 2,
    name: "Manginasall Classic Burger",
    price: 16.50,
    category: "Burgers",
    status: "Active",
    stock: 32,
    image: "https://image.qwenlm.ai/public_source/e8b5c795-56c3-4a48-afa8-1f26e4d9a353/14b2d5f5a-2a5a-4e1b-9fcd-fa31c36cc7cb.png"
  },
  {
    id: 3,
    name: "Spicy Buffalo Wings",
    price: 12.99,
    category: "Appetizers",
    status: "Active",
    stock: 28,
    image: "https://image.qwenlm.ai/public_source/e8b5c795-56c3-4a48-afa8-1f26e4d9a353/1673e0362-a8d8-4370-9473-be54021e99f8.png"
  },
  {
    id: 4,
    name: "Smoked Brisket Platter",
    price: 28.00,
    category: "BBQ Specials",
    status: "Low Stock",
    stock: 8,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 5,
    name: "BBQ Pulled Pork Sandwich",
    price: 14.99,
    category: "Sandwiches",
    status: "Active",
    stock: 22,
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 6,
    name: "Grilled Corn on the Cob",
    price: 6.99,
    category: "Sides",
    status: "Active",
    stock: 50,
    image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&q=80&w=800"
  }
];

const INITIAL_CUSTOMERS = [
  { id: 1, name: "Alice Freeman", email: "alice@email.com", phone: "+1-555-0101", orders: 12, totalSpent: 456.50, joined: "2024-01-15", status: "VIP" },
  { id: 2, name: "Bob Smith", email: "bob@email.com", phone: "+1-555-0102", orders: 8, totalSpent: 320.00, joined: "2024-02-20", status: "Regular" },
  { id: 3, name: "Charlie Davis", email: "charlie@email.com", phone: "+1-555-0103", orders: 5, totalSpent: 178.20, joined: "2024-03-10", status: "Regular" },
  { id: 4, name: "Diana Prince", email: "diana@email.com", phone: "+1-555-0104", orders: 25, totalSpent: 1250.00, joined: "2023-11-05", status: "VIP" },
  { id: 5, name: "Evan Wright", email: "evan@email.com", phone: "+1-555-0105", orders: 3, totalSpent: 89.00, joined: "2024-04-01", status: "New" },
  { id: 6, name: "Fiona Green", email: "fiona@email.com", phone: "+1-555-0106", orders: 15, totalSpent: 678.90, joined: "2024-01-28", status: "VIP" },
  { id: 7, name: "George Hall", email: "george@email.com", phone: "+1-555-0107", orders: 7, totalSpent: 245.50, joined: "2024-02-14", status: "Regular" },
  { id: 8, name: "Hannah Lee", email: "hannah@email.com", phone: "+1-555-0108", orders: 2, totalSpent: 54.00, joined: "2024-04-15", status: "New" }
];

const INITIAL_ORDERS = [
  { id: "#ORD-7752", customer: "Alice Freeman", customerId: 1, total: 45.50, status: "Cooking", date: "2024-04-20 14:30", items: 3 },
  { id: "#ORD-7751", customer: "Bob Smith", customerId: 2, total: 120.00, status: "Ready", date: "2024-04-20 14:15", items: 8 },
  { id: "#ORD-7750", customer: "Charlie Davis", customerId: 3, total: 32.20, status: "Pending", date: "2024-04-20 14:08", items: 2 },
  { id: "#ORD-7749", customer: "Diana Prince", customerId: 4, total: 85.00, status: "Delivered", date: "2024-04-20 13:30", items: 5 },
  { id: "#ORD-7748", customer: "Evan Wright", customerId: 5, total: 54.00, status: "Delivered", date: "2024-04-20 12:45", items: 4 },
];

const SALES_DATA = [
  { name: 'Mon', sales: 4000, orders: 24, customers: 18 },
  { name: 'Tue', sales: 3000, orders: 18, customers: 15 },
  { name: 'Wed', sales: 2000, orders: 12, customers: 10 },
  { name: 'Thu', sales: 2780, orders: 20, customers: 16 },
  { name: 'Fri', sales: 1890, orders: 15, customers: 12 },
  { name: 'Sat', sales: 2390, orders: 22, customers: 20 },
  { name: 'Sun', sales: 3490, orders: 28, customers: 24 },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={active ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
      <span className="font-medium">{label}</span>
    </div>
    {badge && (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
        active ? 'bg-white/20 text-white' : 'bg-orange-500/20 text-orange-500'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({ title, value, trend, icon: Icon, color, trendValue }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-slate-800 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-600 transition-all"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon size={80} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')} bg-opacity-20`}>
          <Icon size={20} className={color} />
        </div>
        <span className="text-slate-400 font-medium">{title}</span>
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <div className="flex items-center gap-2 text-sm">
        <span className={`${trendValue >= 0 ? 'text-emerald-400' : 'text-red-400'} flex items-center font-medium`}>
          <TrendingUp size={14} className={`mr-1 ${trendValue < 0 ? 'rotate-180' : ''}`} /> {Math.abs(trendValue)}%
        </span>
        <span className="text-slate-500">vs last week</span>
      </div>
    </div>
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Cooking: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Ready: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Delivered: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    VIP: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Regular: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    New: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Low Stock": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg mx-4 pointer-events-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 50, x: '-50%' }}
    className={`fixed bottom-6 left-1/2 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 ${
      type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-slate-700'
    } text-white`}
  >
    {type === 'success' ? <CheckCircle size={20} /> : type === 'error' ? <AlertCircle size={20} /> : <Bell size={20} />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-70">
      <X size={16} />
    </button>
  </motion.div>
);

// --- Main Views ---

const DashboardView = ({ orders, customers, products }) => {
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => ['Pending', 'Cooking', 'Ready'].includes(o.status)).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value={`$${totalSales.toFixed(2)}`} trend="+12.5%" trendValue={12.5} icon={DollarSign} color="text-orange-500" />
        <StatCard title="Active Orders" value={activeOrders} trend="+5.2%" trendValue={5.2} icon={ShoppingBag} color="text-blue-500" />
        <StatCard title="Total Customers" value={totalCustomers} trend="+8.1%" trendValue={8.1} icon={Users} color="text-emerald-500" />
        <StatCard title="Products" value={products.length} trend="+2.4%" trendValue={2.4} icon={Package} color="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
            <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg p-2 outline-none focus:border-orange-500">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_DATA}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Customer Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'VIP', value: customers.filter(c => c.status === 'VIP').length },
                { name: 'Regular', value: customers.filter(c => c.status === 'Regular').length },
                { name: 'New', value: customers.filter(c => c.status === 'New').length }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">VIP Customers</span>
              <span className="text-purple-400 font-bold">{customers.filter(c => c.status === 'VIP').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Regular Customers</span>
              <span className="text-blue-400 font-bold">{customers.filter(c => c.status === 'Regular').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">New Customers</span>
              <span className="text-emerald-400 font-bold">{customers.filter(c => c.status === 'New').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Recent Orders</h3>
          <button className="text-orange-500 text-sm font-medium hover:text-orange-400 transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-slate-400 text-xs uppercase">
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4">Order ID</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{order.id}</td>
                  <td className="py-3 px-4 text-slate-300">{order.customer}</td>
                  <td className="py-3 px-4 font-medium text-white">${order.total.toFixed(2)}</td>
                  <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                  <td className="py-3 px-4 text-slate-400 text-sm">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const OrdersView = ({ orders, setOrders, customers, products, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({ customer: '', total: 0, items: 1 });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveOrder = () => {
    if (editingOrder) {
      const updated = orders.map(o => o.id === editingOrder.id ? { ...editingOrder, ...newOrder } : o);
      setOrders(updated);
      saveToStorage(STORAGE_KEYS.ORDERS, updated);
      showToast('Order updated successfully', 'success');
    } else {
      const order = {
        id: `#ORD-${7753 + orders.length}`,
        customerId: customers.find(c => c.name === newOrder.customer)?.id || 0,
        status: 'Pending',
        date: new Date().toLocaleString(),
        ...newOrder
      };
      const updated = [order, ...orders];
      setOrders(updated);
      saveToStorage(STORAGE_KEYS.ORDERS, updated);
      showToast('Order created successfully', 'success');
    }
    setIsModalOpen(false);
    setEditingOrder(null);
    setNewOrder({ customer: '', total: 0, items: 1 });
  };

  const updateOrderStatus = (id, newStatus) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updated);
    saveToStorage(STORAGE_KEYS.ORDERS, updated);
    showToast(`Order ${newStatus.toLowerCase()}`, 'success');
  };

  const deleteOrder = (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const updated = orders.filter(o => o.id !== id);
      setOrders(updated);
      saveToStorage(STORAGE_KEYS.ORDERS, updated);
      showToast('Order deleted', 'success');
    }
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setNewOrder({ customer: order.customer, total: order.total, items: order.items });
    setIsModalOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Order Management</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 w-full sm:w-64"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Cooking">Cooking</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button 
              onClick={() => { setEditingOrder(null); setNewOrder({ customer: '', total: 0, items: 1 }); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-all"
            >
              <Plus size={18} /> New Order
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{order.id}</td>
                  <td className="px-6 py-4 text-slate-300">{order.customer}</td>
                  <td className="px-6 py-4 text-slate-300">{order.items} items</td>
                  <td className="px-6 py-4 font-medium text-white">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{order.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === 'Pending' && (
                        <button onClick={() => updateOrderStatus(order.id, 'Cooking')} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Start Cooking">
                          <UtensilsCrossed size={18} />
                        </button>
                      )}
                      {order.status === 'Cooking' && (
                        <button onClick={() => updateOrderStatus(order.id, 'Ready')} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors" title="Mark Ready">
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {order.status === 'Ready' && (
                        <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="p-2 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors" title="Mark Delivered">
                          <Package size={18} />
                        </button>
                      )}
                      <button onClick={() => openEditModal(order)} className="p-2 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => deleteOrder(order.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p>No orders found matching your criteria</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingOrder ? 'Edit Order' : 'Create New Order'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Customer</label>
            <select 
              value={newOrder.customer}
              onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Total Amount ($)</label>
            <input 
              type="number" 
              value={newOrder.total}
              onChange={(e) => setNewOrder({ ...newOrder, total: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Number of Items</label>
            <input 
              type="number" 
              value={newOrder.items}
              onChange={(e) => setNewOrder({ ...newOrder, items: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button onClick={handleSaveOrder} className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
              {editingOrder ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

const ProductsView = ({ products, setProducts, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, category: '', stock: 0, status: 'Active', image: '' });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProduct = () => {
    if (editingProduct) {
      const updated = products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...newProduct } : p);
      setProducts(updated);
      saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
      showToast('Product updated successfully', 'success');
    } else {
      const product = {
        id: products.length + 1,
        image: newProduct.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
        ...newProduct
      };
      const updated = [...products, product];
      setProducts(updated);
      saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
      showToast('Product created successfully', 'success');
    }
    setIsModalOpen(false);
    setEditingProduct(null);
    setNewProduct({ name: '', price: 0, category: '', stock: 0, status: 'Active', image: '' });
  };

  const deleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
      showToast('Product deleted', 'success');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewProduct({ name: product.name, price: product.price, category: product.category, stock: product.stock, status: product.status, image: product.image });
    setIsModalOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 w-full sm:w-80"
            />
          </div>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setNewProduct({ name: '', price: 0, category: '', stock: 0, status: 'Active', image: '' }); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-900/20"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <motion.div 
            key={product.id}
            whileHover={{ y: -5 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-orange-900/10 transition-all duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-3 right-3 flex gap-2">
                <StatusBadge status={product.stock < 10 ? 'Low Stock' : product.status} />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => openEditModal(product)} className="p-3 bg-white/20 backdrop-blur-sm hover:bg-orange-600 rounded-full transition-colors">
                  <Edit size={20} className="text-white" />
                </button>
                <button onClick={() => deleteProduct(product.id)} className="p-3 bg-white/20 backdrop-blur-sm hover:bg-red-600 rounded-full transition-colors">
                  <Trash2 size={20} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="text-xs text-orange-500 font-bold mb-1 uppercase tracking-wide">{product.category}</div>
              <h3 className="text-lg font-bold text-white mb-2 truncate">{product.name}</h3>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
                  <span className="text-slate-400 text-sm ml-2">({product.stock} in stock)</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        <button 
          onClick={() => { setEditingProduct(null); setNewProduct({ name: '', price: 0, category: '', stock: 0, status: 'Active', image: '' }); setIsModalOpen(true); }}
          className="border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500 hover:text-orange-500 hover:border-orange-500 hover:bg-slate-800/50 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-orange-500/20 flex items-center justify-center mb-4 transition-colors">
            <Plus size={32} />
          </div>
          <span className="font-medium">Add New Product</span>
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Product Name</label>
            <input 
              type="text" 
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="Enter product name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Price ($)</label>
              <input 
                type="number" 
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Stock</label>
              <input 
                type="number" 
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <input 
              type="text" 
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="e.g., BBQ Specials, Burgers"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <select 
              value={newProduct.status}
              onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Image URL</label>
            <input 
              type="text" 
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button onClick={handleSaveProduct} className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

const CustomersView = ({ customers, setCustomers, orders, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', status: 'New' });

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveCustomer = () => {
    if (editingCustomer) {
      const updated = customers.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...newCustomer } : c);
      setCustomers(updated);
      saveToStorage(STORAGE_KEYS.CUSTOMERS, updated);
      showToast('Customer updated successfully', 'success');
    } else {
      const customer = {
        id: customers.length + 1,
        orders: 0,
        totalSpent: 0,
        joined: new Date().toISOString().split('T')[0],
        ...newCustomer
      };
      const updated = [...customers, customer];
      setCustomers(updated);
      saveToStorage(STORAGE_KEYS.CUSTOMERS, updated);
      showToast('Customer created successfully', 'success');
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
    setNewCustomer({ name: '', email: '', phone: '', status: 'New' });
  };

  const deleteCustomer = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const updated = customers.filter(c => c.id !== id);
      setCustomers(updated);
      saveToStorage(STORAGE_KEYS.CUSTOMERS, updated);
      showToast('Customer deleted', 'success');
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer({ name: customer.name, email: customer.email, phone: customer.phone, status: customer.status });
    setIsModalOpen(true);
  };

  const customerOrders = (customerId) => orders.filter(o => o.customerId === customerId);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Total Customers</div>
          <div className="text-2xl font-bold text-white">{customers.length}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">VIP Customers</div>
          <div className="text-2xl font-bold text-purple-400">{customers.filter(c => c.status === 'VIP').length}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">New This Month</div>
          <div className="text-2xl font-bold text-emerald-400">{customers.filter(c => c.status === 'New').length}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Regular</div>
          <div className="text-2xl font-bold text-blue-400">{customers.filter(c => c.status === 'Regular').length}</div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Customer Management</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search customers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 w-full sm:w-64"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
            >
              <option value="All">All Status</option>
              <option value="VIP">VIP</option>
              <option value="Regular">Regular</option>
              <option value="New">New</option>
            </select>
            <button 
              onClick={() => { setEditingCustomer(null); setNewCustomer({ name: '', email: '', phone: '', status: 'New' }); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-all"
            >
              <Plus size={18} /> Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{customer.name}</p>
                        <p className="text-xs text-slate-400">ID: #{customer.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Mail size={14} /> {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Phone size={14} /> {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{customer.orders} orders</td>
                  <td className="px-6 py-4 font-medium text-white">${customer.totalSpent.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} /> {customer.joined}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewCustomer(customer)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="View Details">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => openEditModal(customer)} className="p-2 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => deleteCustomer(customer.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No customers found matching your criteria</p>
          </div>
        )}
      </div>

      {/* View Customer Modal */}
      <Modal isOpen={!!viewCustomer} onClose={() => setViewCustomer(null)} title={viewCustomer?.name || 'Customer Details'}>
        {viewCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-3xl font-bold">
                {viewCustomer.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{viewCustomer.name}</h3>
                <StatusBadge status={viewCustomer.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-2">
                  <Mail size={14} /> Email
                </div>
                <div className="text-white font-medium">{viewCustomer.email}</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-2">
                  <Phone size={14} /> Phone
                </div>
                <div className="text-white font-medium">{viewCustomer.phone}</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-2">
                  <Package size={14} /> Total Orders
                </div>
                <div className="text-white font-medium">{viewCustomer.orders}</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-2">
                  <DollarSign size={14} /> Total Spent
                </div>
                <div className="text-white font-medium">${viewCustomer.totalSpent.toFixed(2)}</div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <ShoppingBag size={18} /> Order History
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {customerOrders(viewCustomer.id).length > 0 ? (
                  customerOrders(viewCustomer.id).map(order => (
                    <div key={order.id} className="flex items-center justify-between bg-slate-900 rounded-lg p-3">
                      <div>
                        <p className="text-white font-medium text-sm">{order.id}</p>
                        <p className="text-slate-400 text-xs">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">${order.total.toFixed(2)}</p>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input 
              type="text" 
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input 
              type="email" 
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="customer@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
            <input 
              type="tel" 
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="+1-555-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <select 
              value={newCustomer.status}
              onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="New">New</option>
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button onClick={handleSaveCustomer} className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
              {editingCustomer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

const SettingsView = ({ showToast }) => {
  const [settings, setSettings] = useState(() => loadFromStorage(STORAGE_KEYS.SETTINGS, {
    restaurantName: "Harrison - Manginasall & BBQ",
    email: "admin@harrison.com",
    phone: "+1-555-0100",
    address: "123 BBQ Street, Food City",
    taxRate: 8.5,
    currency: "USD"
  }));

  const handleSave = () => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    showToast('Settings saved successfully', 'success');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Restaurant Settings</h2>
          <p className="text-slate-400 text-sm">Manage your restaurant information and preferences</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Restaurant Name</label>
            <input 
              type="text" 
              value={settings.restaurantName}
              onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input 
                type="email" 
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <input 
                type="tel" 
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
            <input 
              type="text" 
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tax Rate (%)</label>
              <input 
                type="number" 
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
              <select 
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-700">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all"
          >
            <Save size={20} /> Save Settings
          </button>
        </div>
      </div>

      <div className="mt-6 bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Data Management</h3>
        <div className="space-y-3">
          <button 
            onClick={() => {
              if (window.confirm('This will reset all data to default. Are you sure?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="flex items-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all w-full"
          >
            <RefreshCw size={20} /> Reset All Data
          </button>
          <button 
            onClick={() => {
              const data = {
                orders: loadFromStorage(STORAGE_KEYS.ORDERS, []),
                products: loadFromStorage(STORAGE_KEYS.PRODUCTS, []),
                customers: loadFromStorage(STORAGE_KEYS.CUSTOMERS, []),
                settings: loadFromStorage(STORAGE_KEYS.SETTINGS, {})
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'harrison-backup.json';
              a.click();
              showToast('Backup downloaded', 'success');
            }}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all w-full"
          >
            <Download size={20} /> Export Data Backup
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- App Component ---

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Load data from localStorage
  const [orders, setOrders] = useState(() => loadFromStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS));
  const [products, setProducts] = useState(() => loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS));
  const [customers, setCustomers] = useState(() => loadFromStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS));

  // Save to localStorage when data changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }, [customers]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const pendingOrders = orders.filter(o => ['Pending', 'Cooking', 'Ready'].includes(o.status)).length;

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardView orders={orders} customers={customers} products={products} />;
      case 'orders': return <OrdersView orders={orders} setOrders={setOrders} customers={customers} products={products} showToast={showToast} />;
      case 'products': return <ProductsView products={products} setProducts={setProducts} showToast={showToast} />;
      case 'customers': return <CustomersView customers={customers} setCustomers={setCustomers} orders={orders} showToast={showToast} />;
      case 'settings': return <SettingsView showToast={showToast} />;
      default: return <DashboardView orders={orders} customers={customers} products={products} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-orange-500 selection:text-white">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-lg">H</span>
          </div>
          <span className="font-bold text-white">Harrison Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center">
              <span className="font-bold text-white text-xl">H</span>
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">Harrison</h1>
              <p className="text-xs text-slate-500 font-medium">Manginasall & BBQ</p>
            </div>
          </div>

          <nav className="px-4 space-y-2">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} 
            />
            <SidebarItem 
              icon={ShoppingBag} 
              label="Orders" 
              active={activeTab === 'orders'} 
              onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }} 
              badge={pendingOrders > 0 ? pendingOrders : null}
            />
            <SidebarItem 
              icon={UtensilsCrossed} 
              label="Products" 
              active={activeTab === 'products'} 
              onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }} 
            />
            <SidebarItem 
              icon={Users} 
              label="Customers" 
              active={activeTab === 'customers'} 
              onClick={() => { setActiveTab('customers'); setIsMobileMenuOpen(false); }} 
            />
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              active={activeTab === 'settings'} 
              onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} 
            />
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent">
            <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3 border border-slate-700">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-orange-500 font-bold">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">Admin User</p>
                <p className="text-xs text-slate-400 truncate">admin@harrison.com</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-900 relative">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white capitalize hidden sm:block">{activeTab}</h2>
            <div className="flex items-center gap-4 ml-auto">
              <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
              </button>
              <button 
                onClick={() => { setActiveTab('orders'); }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-orange-900/20 transition-all"
              >
                + New Order
              </button>
            </div>
          </header>

          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App
