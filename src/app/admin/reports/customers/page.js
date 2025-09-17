"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CustomersReportPage() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const custSnap = await getDocs(collection(db, "customers"));
        setCustomers(custSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const orderSnap = await getDocs(collection(db, "orders"));
        setOrders(orderSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="p-6">Loading customers...</p>;

  const totalCustomers = customers.length;

  // New customers this month
  const now = new Date();
  const newThisMonth = customers.filter((c) => {
    const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  // Repeat customers (customers with >1 order)
  const repeatCustomers = customers.filter((c) => {
    const orderCount = orders.filter((o) => o.customerId === c.id).length;
    return orderCount > 1;
  }).length;

  // Chart: new customers by month
  const monthly = {};
  customers.forEach((c) => {
    const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    monthly[key] = (monthly[key] || 0) + 1;
  });
  const chartData = Object.entries(monthly).map(([month, value]) => ({
    month,
    customers: value,
  }));

  // Top customers by spend
  const spendByCustomer = {};
  orders.forEach((o) => {
    if (!o.customerId) return;
    spendByCustomer[o.customerId] = (spendByCustomer[o.customerId] || 0) + (o.total || 0);
  });
  const topCustomers = Object.entries(spendByCustomer)
    .map(([id, spend]) => {
      const customer = customers.find((c) => c.id === id) || {};
      return { id, name: customer.name || "-", email: customer.email || "-", spend };
    })
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);

  return (
    <div className="p-6 font-inter text-gray-800">
      <h1 className="text-3xl font-playfair font-bold mb-6">Customers Report</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold">Total Customers</h2>
          <p className="text-2xl font-bold text-brand mt-2">{totalCustomers}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold">New This Month</h2>
          <p className="text-2xl font-bold text-brand mt-2">{newThisMonth}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold">Repeat Customers</h2>
          <p className="text-2xl font-bold text-brand mt-2">{repeatCustomers}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border rounded-lg p-6 shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">New Customers Per Month</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="customers" stroke="#003D3A" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Customers */}
      <div className="bg-white border rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Top Customers by Spend</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-brand-light text-left">
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Total Spend</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{c.name}</td>
                  <td className="p-3 border">{c.email}</td>
                  <td className="p-3 border">₹{c.spend.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Back button */}
      <div className="mt-6">
        <Link
          href="/admin/reports"
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          ← Back to Reports Dashboard
        </Link>
      </div>
    </div>
  );
}
