"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { card, cardBody, sectionTitle } from "@/components/admin/ui";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderSnap = await getDocs(collection(db, "orders"));
        setOrders(orderSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const custSnap = await getDocs(collection(db, "customers"));
        setCustomers(custSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading dashboard…</p>;

  // Metrics
  const totalOrders = orders.length;
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = totalOrders ? (revenue / totalOrders).toFixed(0) : 0;
  const newCustomers = customers.length;

  // Best selling products
  const productMap = {};
  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const key = item.productName || item.productCode;
      if (!productMap[key]) productMap[key] = 0;
      productMap[key] += item.quantity || 1;
    });
  });
  const bestSelling = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
        Dashboard
      </h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={card}>
          <div className={cardBody}>
            <h2 className="text-sm text-gray-500">Total Orders</h2>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
        </div>
        <div className={card}>
          <div className={cardBody}>
            <h2 className="text-sm text-gray-500">Revenue</h2>
            <p className="text-2xl font-bold text-gray-900">
              ₹{revenue.toLocaleString()}
            </p>
          </div>
        </div>
        <div className={card}>
          <div className={cardBody}>
            <h2 className="text-sm text-gray-500">Avg. Order Value</h2>
            <p className="text-2xl font-bold text-gray-900">
              ₹{avgOrderValue}
            </p>
          </div>
        </div>
        <div className={card}>
          <div className={cardBody}>
            <h2 className="text-sm text-gray-500">New Customers</h2>
            <p className="text-2xl font-bold text-gray-900">
              {newCustomers}
            </p>
          </div>
        </div>
      </div>

      {/* Best Selling */}
      <div className={`${card} mt-8`}>
        <div className={cardBody}>
          <h2 className={sectionTitle}>Best Selling Products</h2>
          <ul className="mt-4 space-y-2">
            {bestSelling.length === 0 ? (
              <li className="text-gray-500 text-sm">No sales data yet</li>
            ) : (
              bestSelling.map(([name, qty]) => (
                <li key={name} className="text-gray-900">
                  {name} — <span className="font-medium">{qty} orders</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
