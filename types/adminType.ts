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
  bestSellingCount: number
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