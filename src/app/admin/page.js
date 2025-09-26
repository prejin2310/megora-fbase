"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { card, cardBody, sectionTitle, subText } from "@/components/admin/ui";
import Chart from "@/components/admin/Chart";
import formatCurrency from "@/utils/formatCurrency";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderSnap = await getDocs(collection(db, "orders"));
        const allOrders = orderSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(allOrders);

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
  const avgOrderValue = totalOrders ? revenue / totalOrders : 0;
  const newCustomers = customers.length;

  // Best selling products
  const productMap = {};
  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const key = item.productName || item.productCode || "Unknown";
      if (!productMap[key]) productMap[key] = 0;
      productMap[key] += item.quantity || 1;
    });
  });
  const bestSelling = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Chart data (last 7 days revenue)
  const salesByDay = {};
  const dayMS = 24 * 60 * 60 * 1000;
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const key = new Date(now - i * dayMS).toISOString().slice(0, 10);
    salesByDay[key] = 0;
  }
  orders.forEach((o) => {
    const day = o.createdAt && o.createdAt.seconds
      ? new Date(o.createdAt.seconds * 1000).toISOString().slice(0, 10)
      : (o.createdAt ? new Date(o.createdAt).toISOString().slice(0,10) : null);
    if (day && salesByDay[day] !== undefined) {
      salesByDay[day] += o.total || 0;
    }
  });
  const chartData = Object.entries(salesByDay).map(([date, total]) => ({ date, total }));

  // Recent orders (limit 8 by latest createdAt)
  const recent = [...orders]
    .sort((a, b) => {
      const ta = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
      const tb = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
      return tb - ta;
    })
    .slice(0, 8);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={card}>
          <div className={cardBody}>
            <h2 className="text-sm text-gray-500">Total Orders</h2>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            <p className={subText}>Orders placed on the store</p>
          </div>
        </div>
        <div className={card}>
          <div className={cardBody}>
            <h2 className="text-sm text-gray-500">Revenue (7d)</h2>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue)}</p>
            <p className={subText}>Total collected from orders</p>
          </div>
        </div>
        <div className={card}>
          <div className={cardBody}>
            <h2 className="text-sm text-gray-500">Avg. Order Value</h2>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgOrderValue)}</p>
            <p className={subText}>Average order value across all orders</p>
          </div>
        </div>
        <div className={card}>
          <div className={cardBody}>
            <h2 className="text-sm text-gray-500">New Customers</h2>
            <p className="text-2xl font-bold text-gray-900">{newCustomers}</p>
            <p className={subText}>Customers registered</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className={`${card} lg:col-span-2`}>
          <div className={cardBody}>
            <h2 className={sectionTitle}>Sales (last 7 days)</h2>
            <div className="mt-4 h-56">
              <Chart data={chartData} />
            </div>
          </div>
        </div>

        <div className={card}>
          <div className={cardBody}>
            <h2 className={sectionTitle}>Recent Orders</h2>
            <div className="mt-4">
              {recent.length === 0 ? (
                <p className="text-sm text-gray-500">No recent orders</p>
              ) : (
                <ul className="space-y-3">
                  {recent.map((o) => (
                    <li key={o.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{o.customerName || o.email || "—"}</div>
                        <div className="text-xs text-gray-500">{o.id}</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(o.total || 0)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
                <li key={name} className="text-gray-900 flex justify-between">
                  <span>{name}</span>
                  <span className="font-medium text-gray-700">{qty}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
