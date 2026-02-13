export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: 'cash' | 'card' | 'gcash' | 'paymaya';
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  stock: number;
  status: 'active' | 'inactive';
  isPopular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  productCount: number;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  bestSellingProduct: string;
}

export interface SalesData {
  date: string;
  sales: number;
}

export interface TopProduct {
  name: string;
  sales: number;
}

export interface Settings {
  storeName: string;
  address: string;
  contactNumber: string;
  businessHours: {
    open: string;
    close: string;
  };
  taxRate: number;
  serviceCharge: number;
}