'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import React, { useState } from 'react'

type PaymentStatus = 'paid' | 'pending' | 'failed'

interface Transaction {
  id: string
  product: string
  amount: number
  method: string
  status: PaymentStatus
  date: string
}

const transactionsData: Transaction[] = [
  {
    id: '1',
    product: 'Chicken Inasal Meal',
    amount: 320,
    method: 'GCash',
    status: 'paid',
    date: '2026-02-01',
  },
  {
    id: '2',
    product: 'BBQ Combo',
    amount: 450,
    method: 'Card',
    status: 'pending',
    date: '2026-02-02',
  },
  {
    id: '3',
    product: 'Family Platter',
    amount: 1200,
    method: 'GrabPay',
    status: 'failed',
    date: '2026-02-03',
  },
  {
    id: '4',
    product: 'Pecho Meal',
    amount: 280,
    method: 'GCash',
    status: 'paid',
    date: '2026-02-04',
  },
]

export default function PaymongoDashboard() {
  const [sortKey, setSortKey] = useState<'date' | 'amount'>('date')

  const sortedTransactions = [...transactionsData].sort((a, b) => {
    if (sortKey === 'amount') {
      return b.amount - a.amount
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const totalSales = transactionsData
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingBalance = transactionsData
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0)

  const failedCount = transactionsData.filter(t => t.status === 'failed').length

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto my-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome back 👋
        </h1>
        <p className="text-gray-500">
          Here’s an overview of your PayMongo payments.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Sales" value={`₱${totalSales.toLocaleString()}`} color="bg-green-50" />
        <StatCard title="Pending Balance" value={`₱${pendingBalance.toLocaleString()}`} color="bg-yellow-50" />
        <StatCard title="Failed Payments" value={failedCount.toString()} color="bg-red-50" />
        <StatCard title="Total Transactions" value={transactionsData.length.toString()} color="bg-blue-50" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-700 mb-4">
          Sales Overview
        </h2>

        <SimpleBarChart />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-700">
            Transactions
          </h2>

          <select
            className="border rounded-md px-3 py-1 text-sm"
            value={sortKey}
            onChange={e => setSortKey(e.target.value as any)}
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="text-left text-gray-500 border-b">
                <TableHead className="py-2">Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map(tx => (
                <TableRow key={tx.id} className="border-b last:border-0">
                  <TableCell className="py-3">{tx.product}</TableCell>
                  <TableCell>₱{tx.amount}</TableCell>
                  <TableCell>{tx.method}</TableCell>
                  <TableCell>
                    <StatusBadge status={tx.status} />
                  </TableCell>
                  <TableCell>{tx.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

/* ---------- Components ---------- */

function StatCard({
  title,
  value,
  color,
}: {
  title: string
  value: string
  color: string
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const styles = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

/* ---------- Simple SVG Chart (No Library) ---------- */

function SimpleBarChart() {
  const data = [
    { label: 'Paid', value: 3, color: '#22c55e' },
    { label: 'Pending', value: 1, color: '#facc15' },
    { label: 'Failed', value: 1, color: '#ef4444' },
  ]

  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="flex items-end gap-6 h-40">
      {data.map(d => (
        <div
          key={d.label}
          className="flex flex-col justify-end items-center w-16 h-full"
        >
          <div
            className="w-full rounded-md"
            style={{
              height: `${(d.value / maxValue) * 100}%`,
              backgroundColor: d.color,
            }}
          />
          <span className="mt-2 text-xs text-gray-600">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

