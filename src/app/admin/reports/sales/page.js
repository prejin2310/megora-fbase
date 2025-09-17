"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function SalesReportPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snap = await getDocs(collection(db, "orders"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(list);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Apply filters
  const filteredOrders = orders.filter((o) => {
    let ok = true;

    // Status filter
    if (statusFilter !== "all" && o.status !== statusFilter) {
      ok = false;
    }

    // Date range filter
    const date = o.createdAt?.toDate
      ? o.createdAt.toDate()
      : new Date(o.createdAt);

    if (startDate && new Date(startDate) > date) ok = false;
    if (endDate && new Date(endDate) < date) ok = false;

    return ok;
  });

  const totalRevenue = filteredOrders.reduce(
    (sum, o) => sum + (o.total || 0),
    0
  );

  if (loading) return <p className="p-6">Loading orders...</p>;

  return (
    <div className="p-6 font-inter text-gray-800">
      <h1 className="text-3xl font-playfair font-bold mb-6">Sales Report</h1>

      {/* Filters */}
      <div className="bg-white border p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row md:items-end gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Order Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-2xl font-bold text-brand mt-2">
            {filteredOrders.length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold">Total Revenue</h2>
          <p className="text-2xl font-bold text-brand mt-2">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-brand-light text-left">
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Customer</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Coupon</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="p-3 border font-semibold">{o.id}</td>
                <td className="p-3 border">{o.customerName || "-"}</td>
                <td className="p-3 border">₹{o.total?.toLocaleString()}</td>
                <td className="p-3 border">
                  {o.coupon?.code ? o.coupon.code : "-"}
                </td>
                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      o.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : o.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="p-3 border">
                  {o.createdAt?.toDate
                    ? o.createdAt.toDate().toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
