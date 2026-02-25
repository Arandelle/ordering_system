'use client'

import React, { useState, useEffect, useCallback } from 'react';
import {
 XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
  LayoutDashboard, Users, UserPlus, Package, Calendar, CheckSquare, FileText,
  Megaphone, Settings, Bell, Search, Plus, Download, Edit, Trash2, Eye, X,
  ChevronLeft, ChevronRight, Menu, CheckCircle, AlertCircle, Laptop, MonitorCheck,
  Smartphone, CardSim, Key, Building,Save, Upload, ArrowUp, ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- LocalStorage Utils ---

const STORAGE_KEYS = {
  EMPLOYEES: 'jpsc_employees',
  ONBOARDING: 'jpsc_onboarding',
  ASSETS: 'jpsc_assets',
  LEAVES: 'jpsc_leaves',
  TASKS: 'jpsc_tasks',
  DOCUMENTS: 'jpsc_documents',
  ANNOUNCEMENTS: 'jpsc_announcements',
  NOTIFICATIONS: 'jpsc_notifications',
  ACTIVITIES: 'jpsc_activities',
  SETTINGS: 'jpsc_settings'
};


// --- Initial Data ---

const INITIAL_EMPLOYEES = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@jpscgroup.com', phone: '+63 917 123 4567', department: 'IT', position: 'IT Manager', hireDate: '2022-03-15', status: 'active', address: 'Makati City' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@jpscgroup.com', phone: '+63 918 234 5678', department: 'HR', position: 'HR Director', hireDate: '2021-06-20', status: 'active', address: 'Taguig City' },
  { id: 3, firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@jpscgroup.com', phone: '+63 919 345 6789', department: 'Sales', position: 'Sales Executive', hireDate: '2023-01-10', status: 'active', address: 'Quezon City' },
  { id: 4, firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@jpscgroup.com', phone: '+63 920 456 7890', department: 'Finance', position: 'Accountant', hireDate: '2022-09-05', status: 'on-leave', address: 'Pasig City' },
  { id: 5, firstName: 'David', lastName: 'Brown', email: 'david.brown@jpscgroup.com', phone: '+63 921 567 8901', department: 'Operations', position: 'Operations Manager', hireDate: '2021-11-30', status: 'active', address: 'Mandaluyong City' }
];

const INITIAL_ONBOARDING = [
  { id: 1, name: 'Emily Chen', department: 'IT', startDate: '2024-02-01', position: 'Developer', progress: 'in-progress', checklist: { orientation: true, itSetup: true, documents: false, training: false, benefits: false } },
  { id: 2, name: 'Robert Garcia', department: 'Sales', startDate: '2024-01-15', position: 'Sales Associate', progress: 'completed', checklist: { orientation: true, itSetup: true, documents: true, training: true, benefits: true } },
  { id: 3, name: 'Lisa Tan', department: 'HR', startDate: '2024-02-15', position: 'HR Coordinator', progress: 'not-started', checklist: { orientation: false, itSetup: false, documents: false, training: false, benefits: false } }
];

const INITIAL_ASSETS = [
  { id: 1, name: 'MacBook Pro 16"', tag: 'LT-001', type: 'laptop', brand: 'Apple', model: 'MacBook Pro 2023', serial: 'C02XY1ABCD', purchaseDate: '2023-06-15', price: 150000, assignedTo: 'John Doe', status: 'active', notes: '' },
  { id: 2, name: 'Workstation PC', tag: 'DT-001', type: 'desktop', brand: 'Dell', model: 'OptiPlex 7090', serial: 'DL123456', purchaseDate: '2023-03-20', price: 85000, assignedTo: 'Jane Smith', status: 'active', notes: '' },
  { id: 3, name: 'iPhone 14 Pro', tag: 'MB-001', type: 'mobile', brand: 'Apple', model: 'iPhone 14 Pro', serial: 'F17XYZ123', purchaseDate: '2023-09-01', price: 65000, assignedTo: 'Mike Johnson', status: 'active', notes: '' },
  { id: 4, name: 'Globe SIM', tag: 'SIM-001', type: 'sim', brand: 'Globe', model: 'Postpaid', serial: '89630123456789', purchaseDate: '2023-01-10', price: 1500, assignedTo: 'Mike Johnson', status: 'active', notes: '' },
  { id: 5, name: 'Company Email Admin', tag: 'PWD-001', type: 'password', brand: '', model: '', serial: '', purchaseDate: '', price: 0, assignedTo: 'IT Admin', status: 'active', notes: 'Main admin account' }
];

const INITIAL_LEAVES = [
  { id: 1, type: 'vacation', start: '2024-01-15', end: '2024-01-17', days: 3, status: 'approved', submitted: '2024-01-10' },
  { id: 2, type: 'sick', start: '2024-02-01', end: '2024-02-02', days: 2, status: 'approved', submitted: '2024-02-01' }
];

const INITIAL_TASKS = [
  { id: 1, title: 'Complete Q1 Report', description: 'Finish quarterly financial report', priority: 'high', status: 'in-progress', dueDate: '2024-02-28', assignedTo: 'Finance Team' },
  { id: 2, title: 'Update Employee Handbook', description: 'Review and update company policies', priority: 'medium', status: 'pending', dueDate: '2024-03-15', assignedTo: 'HR Team' },
  { id: 3, title: 'Server Maintenance', description: 'Monthly server maintenance and backup', priority: 'urgent', status: 'completed', dueDate: '2024-02-10', assignedTo: 'IT Team' }
];

const INITIAL_DOCUMENTS = [
  { id: 1, name: 'Employee Handbook 2024', category: 'policies', size: '2.4 MB', uploaded: '2024-01-05', type: 'pdf' },
  { id: 2, name: 'Leave Request Form', category: 'forms', size: '156 KB', uploaded: '2024-01-10', type: 'docx' },
  { id: 3, name: 'Q4 2023 Report', category: 'reports', size: '5.1 MB', uploaded: '2024-01-20', type: 'pdf' },
  { id: 4, name: 'IT Security Policy', category: 'policies', size: '890 KB', uploaded: '2024-02-01', type: 'pdf' }
];

const INITIAL_ANNOUNCEMENTS = [
  { id: 1, title: 'Welcome New Team Members', category: 'general', content: 'Please join us in welcoming our new team members who joined this month!', date: '2024-02-01', author: 'HR Team' },
  { id: 2, title: 'Office Closure Notice', category: 'urgent', content: 'The office will be closed on February 25 for a company-wide event.', date: '2024-02-15', author: 'Management' },
  { id: 3, title: 'New Benefits Program', category: 'hr', content: 'We are excited to announce our new employee benefits program starting March 1.', date: '2024-02-10', author: 'HR Team' }
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'New Onboarding', message: 'Emily Chen onboarding started', time: '2 hours ago', read: false },
  { id: 2, title: 'Leave Approved', message: 'Your leave request has been approved', time: '5 hours ago', read: false },
  { id: 3, title: 'Task Due Soon', message: 'Q1 Report due in 3 days', time: '1 day ago', read: false }
];

const INITIAL_ACTIVITIES = [
  { id: 1, action: 'New employee added', user: 'Admin', time: '2 hours ago' },
  { id: 2, action: 'Asset assigned', user: 'IT Team', time: '5 hours ago' },
  { id: 3, action: 'Leave request submitted', user: 'Sarah Williams', time: '1 day ago' },
  { id: 4, action: 'Task completed', user: 'John Doe', time: '2 days ago' }
];

const EMPLOYEE_GROWTH_DATA = [
  { month: 'Sep', employees: 42 },
  { month: 'Oct', employees: 45 },
  { month: 'Nov', employees: 48 },
  { month: 'Dec', employees: 50 },
  { month: 'Jan', employees: 52 },
  { month: 'Feb', employees: 55 }
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-5 py-3 text-blue-100 transition-all duration-300 relative group ${
      active ? 'bg-white/10 border-l-4 border-blue-500' : 'hover:bg-white/10'
    }`}
  >
    <div className="flex items-center">
      <Icon size={20} className="w-6 text-center flex-shrink-0" />
      {!collapsed && <span className="nav-text ml-3 text-sm font-medium">{label}</span>}
    </div>
    {!collapsed && badge > 0 && (
      <span className="notification-badge bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
        {badge}
      </span>
    )}
    {collapsed && badge > 0 && (
      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
    )}
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    'on-leave': 'bg-yellow-100 text-yellow-800',
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-indigo-100 text-indigo-800',
    completed: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-orange-100 text-orange-800',
    'not-started': 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    general: 'bg-blue-100 text-blue-700',
    hr: 'bg-green-100 text-green-700',
    events: 'bg-purple-100 text-purple-700',
    policy: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || styles.active}`}>
      {status}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'lg' }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className={`bg-white rounded-xl shadow-2xl w-full ${size === 'xl' ? 'max-w-4xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'} mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto`}>
            <div className="p-5 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-5">
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
    className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-3 ${
      type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-gray-800'
    } text-white`}
  >
    {type === 'success' ? <CheckCircle size={20} /> : type === 'error' ? <AlertCircle size={20} /> : <Bell size={20} />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-70">
      <X size={16} />
    </button>
  </motion.div>
);

const StatCard = ({ title, value, icon: Icon, iconBg, trend, trendValue, color }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="stat-card card p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${iconBg}`}>
        <Icon size={20} />
      </div>
    </div>
    {trend && (
      <p className={`text-xs mt-2 flex items-center ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {trendValue >= 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
        {Math.abs(trendValue)}% {trend}
      </p>
    )}
  </motion.div>
);

// --- Page Components ---

const DashboardPage = ({ employees, onboarding, assets, leaves, activities, notifications }) => {
  const assetTypeCounts = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {});

  const assetChartData = [
    { name: 'Laptops', value: assetTypeCounts.laptop || 0, color: '#3b82f6' },
    { name: 'Desktops', value: assetTypeCounts.desktop || 0, color: '#8b5cf6' },
    { name: 'Mobile', value: assetTypeCounts.mobile || 0, color: '#f59e0b' },
    { name: 'SIM', value: assetTypeCounts.sim || 0, color: '#10b981' },
    { name: 'Passwords', value: assetTypeCounts.password || 0, color: '#ef4444' }
  ];

  const pendingOnboarding = onboarding.filter(o => o.progress !== 'completed').length;
  const activeLeaves = leaves.filter(l => l.status === 'approved').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Employees"
          value={employees.length}
          icon={Users}
          iconBg="bg-blue-100 text-blue-600"
          trend="from last month"
          trendValue={8}
        />
        <StatCard
          title="Total Assets"
          value={assets.length}
          icon={Package}
          iconBg="bg-purple-100 text-purple-600"
          trend="active devices"
          trendValue={5}
        />
        <StatCard
          title="Pending Onboarding"
          value={pendingOnboarding}
          icon={UserPlus}
          iconBg="bg-orange-100 text-orange-600"
          trend="requires attention"
          trendValue={-12}
        />
        <StatCard
          title="Active Leaves"
          value={activeLeaves}
          icon={Calendar}
          iconBg="bg-green-100 text-green-600"
          trend="this month"
          trendValue={3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 bg-white rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Employee Growth</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EMPLOYEE_GROWTH_DATA}>
                <defs>
                  <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="employees" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEmployees)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 bg-white rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Asset Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
            <button className="text-blue-600 text-sm hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Events</h3>
            <button className="text-blue-600 text-sm hover:underline">View Calendar</button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Team Building', date: 'Feb 28, 2024', type: 'Company-wide' },
              { title: 'Q1 Review Meeting', date: 'Mar 5, 2024', type: 'Management' },
              { title: 'Training Session', date: 'Mar 10, 2024', type: 'IT Department' }
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{event.title}</p>
                  <p className="text-xs text-gray-500">{event.type}</p>
                </div>
                <p className="text-xs text-blue-600 font-medium">{event.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmployeesPage = ({ employees, setEmployees, showToast, addActivity }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', department: '', position: '', hireDate: '', status: 'active', address: ''
  });

  const filteredEmployees = employees.filter(emp => {
    const deptMatch = deptFilter === 'all' || emp.department === deptFilter;
    const statusMatch = statusFilter === 'all' || emp.status === statusFilter;
    return deptMatch && statusMatch;
  });

  const openModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData(employee);
    } else {
      setEditingEmployee(null);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', department: '', position: '', hireDate: '', status: 'active', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEmployee) {
      setEmployees(employees.map(emp => emp.id === editingEmployee.id ? { ...formData, id: editingEmployee.id } : emp));
      showToast('Employee updated successfully', 'success');
    } else {
      const newEmployee = { ...formData, id: Date.now() };
      setEmployees([...employees, newEmployee]);
      showToast('Employee added successfully', 'success');
      addActivity('New employee added', `${formData.firstName} ${formData.lastName}`);
    }
    setIsModalOpen(false);
    saveToStorage(STORAGE_KEYS.EMPLOYEES, editingEmployee ? employees.map(emp => emp.id === editingEmployee.id ? { ...formData, id: editingEmployee.id } : emp) : [...employees, { ...formData, id: Date.now() }]);
  };

  const deleteEmployee = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
      showToast('Employee deleted successfully', 'success');
      saveToStorage(STORAGE_KEYS.EMPLOYEES, employees.filter(emp => emp.id !== id));
    }
  };

  const exportEmployees = () => {
    const data = JSON.stringify(employees, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jpsc-employees.json';
    a.click();
    showToast('Data exported successfully', 'success');
  };

  const avatarColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      {/* Actions Bar */}
      <div className="card p-5 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => openModal()} className="btn-primary bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:shadow-lg transition-all">
              <Plus size={18} />
              <span>Add Employee</span>
            </button>
            <button onClick={exportEmployees} className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition flex items-center space-x-2">
              <Download size={18} />
              <span>Export</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
              <option value="all">All Departments</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="table-row hover:bg-gray-50 transition-all">
                  <td className="px-5 py-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full ${avatarColors[emp.id % avatarColors.length]} flex items-center justify-center text-white font-semibold mr-3`}>
                        {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-500">ID: EMP-{String(emp.id).padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{emp.department}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{emp.position}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{emp.email}</td>
                  <td className="px-5 py-4"><StatusBadge status={emp.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => openModal(emp)} className="text-blue-600 hover:text-blue-800 transition-colors"><Edit size={18} /></button>
                      <button onClick={() => deleteEmployee(emp.id)} className="text-red-600 hover:text-red-800 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmployee ? 'Edit Employee' : 'Add Employee'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
              <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
              <input type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
              <input type="date" value={formData.hireDate} onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">Cancel</button>
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg text-sm hover:shadow-lg transition-all">Save Employee</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

const OnboardingPage = ({ onboarding, setOnboarding, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', department: '', startDate: '', position: '', progress: 'not-started',
    checklist: { orientation: false, itSetup: false, documents: false, training: false, benefits: false }
  });

  const notStarted = onboarding.filter(o => o.progress === 'not-started');
  const inProgress = onboarding.filter(o => o.progress === 'in-progress');
  const completed = onboarding.filter(o => o.progress === 'completed');

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: '', department: '', startDate: '', position: '', progress: 'not-started', checklist: { orientation: false, itSetup: false, documents: false, training: false, benefits: false } });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setOnboarding(onboarding.map(item => item.id === editingItem.id ? { ...formData, id: editingItem.id } : item));
      showToast('Onboarding updated successfully', 'success');
    } else {
      setOnboarding([...onboarding, { ...formData, id: Date.now() }]);
      showToast('Onboarding created successfully', 'success');
    }
    setIsModalOpen(false);
    saveToStorage(STORAGE_KEYS.ONBOARDING, editingItem ? onboarding.map(item => item.id === editingItem.id ? { ...formData, id: editingItem.id } : item) : [...onboarding, { ...formData, id: Date.now() }]);
  };

  const OnboardingColumn = ({ title, items, status, countId, badgeClass }) => (
    <div className="card p-5 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-700">{title}</h4>
        <span className={`status-badge ${badgeClass}`}>{items.length}</span>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-800 text-sm">{item.name}</p>
              <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800"><Edit size={14} /></button>
            </div>
            <p className="text-xs text-gray-500">{item.department} - {item.position}</p>
            <p className="text-xs text-gray-400 mt-1">Start: {item.startDate}</p>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No items</p>}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="card p-5 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Onboarding Pipeline</h3>
            <p className="text-sm text-gray-500">Track new employee onboarding progress</p>
          </div>
          <button onClick={() => openModal()} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:shadow-lg transition-all">
            <Plus size={18} />
            <span>New Onboarding</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OnboardingColumn title="Not Started" items={notStarted} status="not-started" badgeClass="status-pending" />
        <OnboardingColumn title="In Progress" items={inProgress} status="in-progress" badgeClass="status-progress" />
        <OnboardingColumn title="Completed" items={completed} status="completed" badgeClass="status-completed" />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Onboarding' : 'New Onboarding'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
              <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <input type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Onboarding Checklist</label>
            <div className="space-y-2">
              {['orientation', 'itSetup', 'documents', 'training', 'benefits'].map((item) => (
                <label key={item} className="flex items-center space-x-3">
                  <input type="checkbox" checked={formData.checklist[item]} onChange={(e) => setFormData({ ...formData, checklist: { ...formData.checklist, [item]: e.target.checked } })} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-gray-700 capitalize">{item.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
            <select value={formData.progress} onChange={(e) => setFormData({ ...formData, progress: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">Cancel</button>
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg text-sm hover:shadow-lg transition-all">Save Onboarding</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

const AssetsPage = ({ assets, setAssets, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '', tag: '', type: 'laptop', status: 'active', brand: '', model: '', serial: '', purchaseDate: '', price: '', assignedTo: '', notes: ''
  });

  const filteredAssets = assets.filter(asset => {
    const typeMatch = typeFilter === 'all' || asset.type === typeFilter;
    const statusMatch = statusFilter === 'all' || asset.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const openModal = (asset = null) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData(asset);
    } else {
      setEditingAsset(null);
      setFormData({ name: '', tag: '', type: 'laptop', status: 'active', brand: '', model: '', serial: '', purchaseDate: '', price: '', assignedTo: '', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAsset) {
      setAssets(assets.map(asset => asset.id === editingAsset.id ? { ...formData, id: editingAsset.id } : asset));
      showToast('Asset updated successfully', 'success');
    } else {
      setAssets([...assets, { ...formData, id: Date.now() }]);
      showToast('Asset added successfully', 'success');
    }
    setIsModalOpen(false);
    saveToStorage(STORAGE_KEYS.ASSETS, editingAsset ? assets.map(asset => asset.id === editingAsset.id ? { ...formData, id: editingAsset.id } : asset) : [...assets, { ...formData, id: Date.now() }]);
  };

  const deleteAsset = (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      setAssets(assets.filter(asset => asset.id !== id));
      showToast('Asset deleted successfully', 'success');
      saveToStorage(STORAGE_KEYS.ASSETS, assets.filter(asset => asset.id !== id));
    }
  };

  const exportAssets = () => {
    const data = JSON.stringify(assets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jpsc-assets.json';
    a.click();
    showToast('Data exported successfully', 'success');
  };

  const getAssetIcon = (type) => {
    const icons = { laptop: Laptop, desktop: MonitorCheck, mobile: Smartphone, sim: CardSim, password: Key };
    return icons[type] || Package;
  };

  const getAssetIconBg = (type) => {
    const colors = { laptop: 'bg-blue-100 text-blue-600', desktop: 'bg-purple-100 text-purple-600', mobile: 'bg-orange-100 text-orange-600', sim: 'bg-green-100 text-green-600', password: 'bg-red-100 text-red-600' };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="card p-5 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => openModal()} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:shadow-lg transition-all">
              <Plus size={18} />
              <span>Add Asset</span>
            </button>
            <button onClick={exportAssets} className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition flex items-center space-x-2">
              <Download size={18} />
              <span>Export</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
              <option value="all">All Types</option>
              <option value="laptop">Laptops</option>
              <option value="desktop">Desktops</option>
              <option value="mobile">Mobile Phones</option>
              <option value="sim">SIM Cards</option>
              <option value="password">Passwords</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssets.map((asset) => {
                const Icon = getAssetIcon(asset.type);
                return (
                  <tr key={asset.id} className="table-row hover:bg-gray-50 transition-all">
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg mr-3 ${getAssetIconBg(asset.type)}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{asset.name}</p>
                          <p className="text-xs text-gray-500">{asset.tag}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 capitalize">{asset.type}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{asset.assignedTo || 'Unassigned'}</td>
                    <td className="px-5 py-4"><StatusBadge status={asset.status} /></td>
                    <td className="px-5 py-4 text-sm text-gray-600">{asset.purchaseDate || '-'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openModal(asset)} className="text-green-600 hover:text-green-800 transition-colors"><Edit size={18} /></button>
                        <button onClick={() => deleteAsset(asset.id)} className="text-red-600 hover:text-red-800 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAsset ? 'Edit Asset' : 'Add Asset'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asset Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asset Tag/ID *</label>
              <input type="text" value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                <option value="laptop">Laptop</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile Phone</option>
                <option value="sim">SIM Card</option>
                <option value="password">Password</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand/Manufacturer</label>
              <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
              <input type="text" value={formData.serial} onChange={(e) => setFormData({ ...formData, serial: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
              <input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price (₱)</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <input type="text" value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">Cancel</button>
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg text-sm hover:shadow-lg transition-all">Save Asset</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

const LeavePage = ({ leaves, setLeaves, showToast }) => {
  const [formData, setFormData] = useState({ type: 'vacation', start: '', end: '', reason: '' });

  const usedDays = leaves.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.days, 0);
  const availableDays = 15 - usedDays;
  const pendingRequests = leaves.filter(l => l.status === 'pending').length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const start = new Date(formData.start);
    const end = new Date(formData.end);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const leave = {
      id: Date.now(),
      type: formData.type,
      start: formData.start,
      end: formData.end,
      days: days,
      status: 'pending',
      submitted: new Date().toISOString().split('T')[0]
    };
    setLeaves([...leaves, leave]);
    showToast('Leave request submitted', 'success');
    setFormData({ type: 'vacation', start: '', end: '', reason: '' });
    saveToStorage(STORAGE_KEYS.LEAVES, [...leaves, leave]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 bg-white rounded-xl shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-2">Available Leave Days</p>
          <p className="text-3xl font-bold text-blue-600">{availableDays}</p>
          <p className="text-xs text-gray-400 mt-1">Out of 15 days</p>
        </div>
        <div className="card p-5 bg-white rounded-xl shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-2">Used This Year</p>
          <p className="text-3xl font-bold text-orange-600">{usedDays}</p>
          <p className="text-xs text-gray-400 mt-1">Days taken</p>
        </div>
        <div className="card p-5 bg-white rounded-xl shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-2">Pending Requests</p>
          <p className="text-3xl font-bold text-green-600">{pendingRequests}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
        </div>
      </div>

      {/* Request Form */}
      <div className="card p-5 bg-white rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Leave</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
              <option value="vacation">Vacation Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="emergency">Emergency Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input type="date" value={formData.start} onChange={(e) => setFormData({ ...formData, start: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input type="date" value={formData.end} onChange={(e) => setFormData({ ...formData, end: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" placeholder="Brief reason for leave request" />
          </div>
          <div className="md:col-span-3">
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg text-sm hover:shadow-lg transition-all">Submit Request</button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="card overflow-hidden bg-white rounded-xl shadow-sm">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Leave History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave.id} className="table-row hover:bg-gray-50 transition-all">
                  <td className="px-5 py-4 text-sm text-gray-600 capitalize">{leave.type}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{leave.start} to {leave.end}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{leave.days}</td>
                  <td className="px-5 py-4"><StatusBadge status={leave.status} /></td>
                  <td className="px-5 py-4 text-sm text-gray-600">{leave.submitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const TasksPage = ({ tasks, setTasks, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '' });

  const filteredTasks = activeTab === 'all' ? tasks : tasks.filter(t => t.status === activeTab);

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData(task);
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...formData, id: editingTask.id } : t));
      showToast('Task updated successfully', 'success');
    } else {
      setTasks([...tasks, { ...formData, id: Date.now(), assignedTo: 'Unassigned' }]);
      showToast('Task created successfully', 'success');
    }
    setIsModalOpen(false);
    saveToStorage(STORAGE_KEYS.TASKS, editingTask ? tasks.map(t => t.id === editingTask.id ? { ...formData, id: editingTask.id } : t) : [...tasks, { ...formData, id: Date.now(), assignedTo: 'Unassigned' }]);
  };

  const deleteTask = (id) => {
    if (window.confirm('Delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
      showToast('Task deleted', 'success');
      saveToStorage(STORAGE_KEYS.TASKS, tasks.filter(t => t.id !== id));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="card p-5 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {['all', 'pending', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'all' ? 'All Tasks' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => openModal()} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:shadow-lg transition-all">
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 bg-white rounded-xl shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <StatusBadge status={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">{task.title}</h4>
                <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span className="flex items-center"><Users size={12} className="mr-1" />{task.assignedTo}</span>
                  <span className="flex items-center"><Calendar size={12} className="mr-1" />{task.dueDate}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => openModal(task)} className="text-blue-600 hover:text-blue-800 transition-colors"><Edit size={18} /></button>
                <button onClick={() => deleteTask(task.id)} className="text-red-600 hover:text-red-800 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask ? 'Edit Task' : 'Add Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">Cancel</button>
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg text-sm hover:shadow-lg transition-all">Save Task</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

const DocumentsPage = ({ documents }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredDocs = activeTab === 'all' ? documents : documents.filter(d => d.category === activeTab);

  const getDocIconColor = (category) => {
    const colors = { policies: 'bg-blue-100 text-blue-600', forms: 'bg-green-100 text-green-600', reports: 'bg-purple-100 text-purple-600' };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="card p-5 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {['all', 'policies', 'forms', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'all' ? 'All Documents' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => alert('Document upload feature - Demo only')} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:shadow-lg transition-all">
            <Upload size={18} />
            <span>Upload</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-4 bg-white rounded-xl shadow-sm"
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 ${getDocIconColor(doc.category)} rounded-lg flex items-center justify-center`}>
                <FileText size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-sm">{doc.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{doc.size} • {doc.uploaded}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors"><Download size={18} /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const AnnouncementsPage = ({ announcements, setAnnouncements, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'general', content: '' });

  const openModal = () => {
    setFormData({ title: '', category: 'general', content: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ann = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      content: formData.content,
      date: new Date().toISOString().split('T')[0],
      author: 'Admin'
    };
    setAnnouncements([ann, ...announcements]);
    showToast('Announcement published', 'success');
    setIsModalOpen(false);
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, [ann, ...announcements]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="card p-5 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Company Announcements</h3>
          <button onClick={openModal} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:shadow-lg transition-all">
            <Plus size={18} />
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 bg-white rounded-xl shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <StatusBadge status={ann.category} />
              <span className="text-xs text-gray-400">{ann.date}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{ann.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{ann.content}</p>
            <p className="text-xs text-gray-400">By {ann.author}</p>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
              <option value="general">General</option>
              <option value="hr">HR</option>
              <option value="events">Events</option>
              <option value="policy">Policy</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows="5" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">Cancel</button>
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg text-sm hover:shadow-lg transition-all">Publish</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

const SettingsPage = ({ showToast }) => {
  const [settings, setSettings] = useState(() => loadFromStorage(STORAGE_KEYS.SETTINGS, {
    companyName: 'JPSC Group Holding',
    industry: 'Consultancy and Management Services',
    address: 'Unit 901, 9th Floor, Century Spire, Century City, Kalayaan Ave, Makati City, 1210 Metro Manila, Philippines',
    email: 'info@jpscgroup.com',
    phone: '+63 2 8123 4567'
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    showToast('Settings saved successfully', 'success');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <div className="card p-6 bg-white rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Settings</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input type="text" value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <input type="text" value={settings.industry} onChange={(e) => setSettings({ ...settings, industry: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input type="text" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <div>
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg text-sm hover:shadow-lg transition-all flex items-center space-x-2">
              <Save size={18} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>

      <div className="card p-6 bg-white rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">System Version</p>
            <p className="font-semibold">v2.1.0</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Last Backup</p>
            <p className="font-semibold">Today, 9:00 AM</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Storage Used</p>
            <p className="font-semibold">2.4 GB / 10 GB</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App Component ---

const ClientPage = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
  setEmployees(loadFromStorage(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES));
  setOnboarding(loadFromStorage(STORAGE_KEYS.ONBOARDING, INITIAL_ONBOARDING));
  setAssets(loadFromStorage(STORAGE_KEYS.ASSETS, INITIAL_ASSETS));
  setLeaves(loadFromStorage(STORAGE_KEYS.LEAVES, INITIAL_LEAVES));
  setTasks(loadFromStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS));
  setDocuments(loadFromStorage(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS));
  setAnnouncements(loadFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS));
  setNotifications(loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS));
  setActivities(loadFromStorage(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES));
}, []);

 const loadFromStorage = (key, defaultValue) => {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
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

  // Data State
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [onboarding, setOnboarding] = useState(INITIAL_ONBOARDING);
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);

  // Save data when changed
 useEffect(() => {
  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
  saveToStorage(STORAGE_KEYS.ONBOARDING, onboarding);
  saveToStorage(STORAGE_KEYS.ASSETS, assets);
  saveToStorage(STORAGE_KEYS.LEAVES, leaves);
  saveToStorage(STORAGE_KEYS.TASKS, tasks);
  saveToStorage(STORAGE_KEYS.DOCUMENTS, documents);
  saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  saveToStorage(STORAGE_KEYS.ACTIVITIES, activities);
}, [
  employees,
  onboarding,
  assets,
  leaves,
  tasks,
  documents,
  announcements,
  notifications,
  activities
]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addActivity = useCallback((action, user) => {
    const newActivity = { id: Date.now(), action, user, time: 'Just now' };
    setActivities(prev => [newActivity, ...prev].slice(0, 20));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingOnboardingCount = onboarding.filter(o => o.progress !== 'completed').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'onboarding', label: 'Onboarding', icon: UserPlus, badge: pendingOnboardingCount },
    { id: 'assets', label: 'Assets', icon: Package },
    { id: 'leave', label: 'Leave Management', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage employees={employees} onboarding={onboarding} assets={assets} leaves={leaves} activities={activities} notifications={notifications} />;
      case 'employees': return <EmployeesPage employees={employees} setEmployees={setEmployees} showToast={showToast} addActivity={addActivity} />;
      case 'onboarding': return <OnboardingPage onboarding={onboarding} setOnboarding={setOnboarding} showToast={showToast} />;
      case 'assets': return <AssetsPage assets={assets} setAssets={setAssets} showToast={showToast} />;
      case 'leave': return <LeavePage leaves={leaves} setLeaves={setLeaves} showToast={showToast} />;
      case 'tasks': return <TasksPage tasks={tasks} setTasks={setTasks} showToast={showToast} />;
      case 'documents': return <DocumentsPage documents={documents} />;
      case 'announcements': return <AnnouncementsPage announcements={announcements} setAnnouncements={setAnnouncements} showToast={showToast} />;
      case 'settings': return <SettingsPage showToast={showToast} />;
      default: return <DashboardPage employees={employees} onboarding={onboarding} assets={assets} leaves={leaves} activities={activities} notifications={notifications} />;
    }
  };

  const pageTitles = {
    dashboard: 'Dashboard',
    employees: 'Employees',
    onboarding: 'Onboarding',
    assets: 'Assets',
    leave: 'Leave Management',
    tasks: 'Tasks',
    documents: 'Documents',
    announcements: 'Announcements',
    settings: 'Settings'
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`sidebar bg-gradient-to-b from-blue-900 to-blue-950 text-white flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} ${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:flex'}`}>
        <div className="p-5 border-b border-blue-800">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Building className="text-blue-800" size={20} />
            </div>
            {!sidebarCollapsed && (
              <div className="logo-text">
                <h1 className="text-base font-bold">JPSC Group</h1>
                <p className="text-xs text-blue-300">Internal System</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activePage === item.id}
              onClick={() => { setActivePage(item.id); setMobileMenuOpen(false); }}
              badge={item.badge || 0}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="flex items-center text-blue-300 hover:text-white transition w-full justify-center">
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!sidebarCollapsed && <span className="nav-text ml-3 text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-gray-600 hover:text-gray-900">
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-bold text-gray-800">{pageTitles[activePage]}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <input type="text" placeholder="Search..." className="search-input pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none w-64 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
                )}
              </button>
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">AD</div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Notifications Panel */}
        <AnimatePresence>
          {notificationsOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed top-16 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <button onClick={() => setNotificationsOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.slice(0, 10).map((notif) => (
                    <div key={notif.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}>
                      <p className="font-medium text-gray-800 text-sm">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200 text-center">
                  <button className="text-blue-600 text-sm hover:underline">Mark all as read</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activePage} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default ClientPage;
