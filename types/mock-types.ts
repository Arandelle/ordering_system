// lib/types.ts
export interface Transaction {
  id: string;
  name: string;           // Product name or customer name
  amount: number;         // in cents (e.g. 150000 = ₱1,500.00)
  paymentMethod: string;
  status: 'Paid' | 'Pending' | 'Failed';
  date: string;           // ISO string or formatted date
}

export interface SummaryStats {
  totalSales: number;
  pendingBalance: number;
  availableBalance: number;
  totalTransactions: number;
}

export interface SalesDataPoint {
  month: string;
  amount: number;
}

export interface PaymentStatusData {
  status: string;
  count: number;
  fill: string;
}