"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function CouponsReportPage() {
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const couponSnap = await getDocs(collection(db, "coupons"));
        setCoupons(couponSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const orderSnap = await getDocs(collection(db, "orders"));
        setOrders(orderSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching coupons report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="p-6">Loading coupons...</p>;

  // Calculate usage stats
  const couponStats = coupons.map((c) => {
    const usedOrders = orders.filter((o) => o.coupon?.code === c.code);
    const usageCount = usedOrders.length;
    const totalDiscount = usedOrders.reduce(
      (sum, o) => sum + (o.coupon?.discount || 0),
      0
    );
    return {
      ...c,
      usageCount,
      totalDiscount,
    };
  });

  return (
    <div className="p-6 font-inter text-gray-800">
      <h1 className="text-3xl font-playfair font-bold mb-6">Coupons Report</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold">Total Coupons</h2>
          <p className="text-2xl font-bold text-brand mt-2">{coupons.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold">Coupons Used</h2>
          <p className="text-2xl font-bold text-brand mt-2">
            {couponStats.filter((c) => c.usageCount > 0).length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold">Total Discount Given</h2>
          <p className="text-2xl font-bold text-brand mt-2">
            ₹
            {couponStats
              .reduce((sum, c) => sum + c.totalDiscount, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg p-6 shadow overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Coupon Usage</h2>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-brand-light text-left">
              <th className="p-3 border">Code</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Value</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Usage Count</th>
              <th className="p-3 border">Total Discount Given</th>
            </tr>
          </thead>
          <tbody>
            {couponStats.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-3 border font-semibold">{c.code}</td>
                <td className="p-3 border">{c.type}</td>
                <td className="p-3 border">
                  {c.type === "percent" ? `${c.value}%` : `₹${c.value}`}
                </td>
                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      c.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-3 border">{c.usageCount}</td>
                <td className="p-3 border">₹{c.totalDiscount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Back */}
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
