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

// export const mockProducts: Product[] = [
//   {
//     id: 'P001',
//     name: 'Chicken Inasal',
//     description: 'Grilled marinated chicken with rice',
//     category: 'Main Course',
//     price: 159,
//     imageUrl: '/products/chicken-inasal.jpg',
//     stock: 45,
//     status: 'active',
//     isPopular: true
//   },
//   {
//     id: 'P002',
//     name: 'Pork BBQ',
//     description: 'Char-grilled pork skewers',
//     category: 'Main Course',
//     price: 129,
//     imageUrl: '/products/pork-bbq.jpg',
//     stock: 38,
//     status: 'active',
//     isPopular: true
//   },
//   {
//     id: 'P003',
//     name: 'Halo-Halo',
//     description: 'Traditional Filipino dessert',
//     category: 'Desserts',
//     price: 89,
//     imageUrl: '/products/halo-halo.jpg',
//     stock: 25,
//     status: 'active'
//   },
//   {
//     id: 'P004',
//     name: 'Beef Tapa',
//     description: 'Marinated beef with garlic rice',
//     category: 'Main Course',
//     price: 189,
//     imageUrl: '/products/beef-tapa.jpg',
//     stock: 20,
//     status: 'active'
//   },
//   {
//     id: 'P005',
//     name: 'Extra Rice',
//     description: 'Unlimited rice serving',
//     category: 'Extras',
//     price: 25,
//     imageUrl: '/products/rice.jpg',
//     stock: 100,
//     status: 'active'
//   },
//   {
//     id: 'P006',
//     name: 'Bangus Belly',
//     description: 'Grilled milkfish belly',
//     category: 'Main Course',
//     price: 199,
//     imageUrl: '/products/bangus.jpg',
//     stock: 15,
//     status: 'active'
//   },
//   {
//     id: 'P007',
//     name: 'Sinigang na Baboy',
//     description: 'Pork in tamarind soup',
//     category: 'Soup',
//     price: 149,
//     imageUrl: '/products/sinigang.jpg',
//     stock: 0,
//     status: 'inactive'
//   }
// ];

export const mockCategories: Category[] = [
  {
    id: 'C001',
    name: 'Main Course',
    productCount: 4,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'C002',
    name: 'Desserts',
    productCount: 1,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'C003',
    name: 'Extras',
    productCount: 1,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'C004',
    name: 'Soup',
    productCount: 1,
    createdAt: new Date('2024-01-01')
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