import {SalesData, TopProduct } from '@/types/adminType';

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