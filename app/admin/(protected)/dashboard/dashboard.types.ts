import { StockStatus } from "@/types/inventory_types";

export interface PendingOrderItem {
  _id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  fulfillmentType: string;
  createdAt: string;
  itemsCount: number;
}

export interface LowStockItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  reorderLevel: number;
  available: number;
  status: StockStatus;
}

export interface NewCustomerItem {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface DashboardActivity {
  pendingOrders: PendingOrderItem[];
  lowStockItems: LowStockItem[];
  newCustomers: NewCustomerItem[];
  newCustomersCount: number;
}