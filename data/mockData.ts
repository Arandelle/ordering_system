import { Order, Product, Category, DashboardStats, SalesData, TopProduct } from '@/types/adminType';

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Maria Santos',
    items: [
      { productId: 'P001', productName: 'Chicken Inasal', quantity: 2, price: 159 },
      { productId: 'P002', productName: 'Pork BBQ', quantity: 1, price: 129 }
    ],
    totalPrice: 447,
    paymentMethod: 'gcash',
    status: 'completed',
    createdAt: new Date('2024-02-13T10:30:00')
  },
  {
    id: 'ORD-002',
    customerName: 'Juan Dela Cruz',
    items: [
      { productId: 'P003', productName: 'Halo-Halo', quantity: 3, price: 89 },
      { productId: 'P001', productName: 'Chicken Inasal', quantity: 1, price: 159 }
    ],
    totalPrice: 426,
    paymentMethod: 'cash',
    status: 'preparing',
    createdAt: new Date('2024-02-13T11:15:00')
  },
  {
    id: 'ORD-003',
    customerName: 'Anna Reyes',
    items: [
      { productId: 'P004', productName: 'Beef Tapa', quantity: 1, price: 189 }
    ],
    totalPrice: 189,
    paymentMethod: 'card',
    status: 'pending',
    createdAt: new Date('2024-02-13T11:45:00')
  },
  {
    id: 'ORD-004',
    customerName: 'Carlos Rivera',
    items: [
      { productId: 'P001', productName: 'Chicken Inasal', quantity: 4, price: 159 },
      { productId: 'P005', productName: 'Extra Rice', quantity: 4, price: 25 }
    ],
    totalPrice: 736,
    paymentMethod: 'paymaya',
    status: 'completed',
    createdAt: new Date('2024-02-13T09:20:00')
  },
  {
    id: 'ORD-005',
    customerName: 'Linda Garcia',
    items: [
      { productId: 'P002', productName: 'Pork BBQ', quantity: 2, price: 129 },
      { productId: 'P003', productName: 'Halo-Halo', quantity: 2, price: 89 }
    ],
    totalPrice: 436,
    paymentMethod: 'gcash',
    status: 'preparing',
    createdAt: new Date('2024-02-13T11:50:00')
  }
];

export const mockDashboardStats: DashboardStats = {
  totalOrders: 128,
  totalRevenue: 45670,
  pendingOrders: 7,
  bestSellingProduct: 'Chicken Inasal'
};

export const mockSalesData: SalesData[] = [
  { date: 'Mon', sales: 4200 },
  { date: 'Tue', sales: 3800 },
  { date: 'Wed', sales: 5100 },
  { date: 'Thu', sales: 4600 },
  { date: 'Fri', sales: 6200 },
  { date: 'Sat', sales: 8400 },
  { date: 'Sun', sales: 7800 }
];

export const mockTopProducts: TopProduct[] = [
  { name: 'Chicken Inasal', sales: 247 },
  { name: 'Pork BBQ', sales: 189 },
  { name: 'Beef Tapa', sales: 134 },
  { name: 'Halo-Halo', sales: 98 }
];