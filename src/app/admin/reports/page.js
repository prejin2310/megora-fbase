"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ReportsPage() {
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const orderSnap = await getDocs(collection(db, "orders"));
      setOrders(orderSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const couponSnap = await getDocs(collection(db, "coupons"));
      setCoupons(couponSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const customerSnap = await getDocs(collection(db, "customers"));
      setCustomers(customerSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  // Summary
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const totalCoupons = coupons.length;

  // Chart data: group by month
  const monthlySales = {};
  orders.forEach((o) => {
    const date = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    monthlySales[key] = (monthlySales[key] || 0) + (o.total || 0);
  });

  const chartData = Object.entries(monthlySales).map(([month, value]) => ({
    month,
    revenue: value,
  }));

  return (
    <div className="p-6 font-inter text-gray-800">
      <h1 className="text-3xl font-playfair font-bold mb-6">Reports Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold">Total Revenue</h2>
          <p className="text-2xl font-bold text-brand mt-2">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold">Orders</h2>
          <p className="text-2xl font-bold text-brand mt-2">{totalOrders}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold">Customers</h2>
          <p className="text-2xl font-bold text-brand mt-2">{totalCustomers}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold">Coupons</h2>
          <p className="text-2xl font-bold text-brand mt-2">{totalCoupons}</p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white border rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#003D3A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Links to detailed reports */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/reports/sales"
          className="block bg-brand text-white p-6 rounded-lg shadow hover:bg-brand-dark transition"
        >
          Sales Report →
        </Link>
        <Link
          href="/admin/reports/customers"
          className="block bg-brand text-white p-6 rounded-lg shadow hover:bg-brand-dark transition"
        >
          Customers Report →
        </Link>
        <Link
          href="/admin/reports/coupons"
          className="block bg-brand text-white p-6 rounded-lg shadow hover:bg-brand-dark transition"
        >
          Coupons Report →
        </Link>
      </div>
    </div>
  );
}
