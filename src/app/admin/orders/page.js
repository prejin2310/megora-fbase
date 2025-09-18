"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  cn, card, cardBody, sectionTitle, subText,
  inputBase, selectBase, buttonPrimary, buttonGhost,
  tableWrap, tableBase, thBase, tdBase, rowHover, badge
} from "@/components/admin/ui";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // filter logic
  const filteredOrders = orders.filter((o) => {
    let ok = true;

    if (statusFilter !== "all" && o.status !== statusFilter) ok = false;

    if (search) {
      const t = search.toLowerCase();
      const idMatch = o.id?.toLowerCase().includes(t);
      const nameMatch = (o.customerName || "").toLowerCase().includes(t);
      ok = idMatch || nameMatch;
    }

    const date = o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt ? new Date(o.createdAt) : null);
    if (date) {
      if (startDate && new Date(startDate) > date) ok = false;
      if (endDate && new Date(endDate) < date) ok = false;
    }

    return ok;
  });

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Orders</h1>
          <p className={subText}>Search, filter and manage recent orders.</p>
        </div>
        {/* future actions placeholder */}
        {/* <button className={buttonPrimary}>Export CSV</button> */}
      </div>

      {/* Filters */}
      <section className={cn(card, "mb-5")}>
        <div className={cardBody}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
              <input
                className={inputBase}
                placeholder="Order ID or customer name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                className={selectBase}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Start date</label>
              <input
                type="date"
                className={inputBase}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End date</label>
              <input
                type="date"
                className={inputBase}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className={card}>
        <div className={cardBody}>
          <div className="flex items-center justify-between mb-3">
            <h2 className={sectionTitle}>All Orders</h2>
            <span className={subText}>{filteredOrders.length} result(s)</span>
          </div>

          <div className={tableWrap}>
            <table className={tableBase}>
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th className={thBase}>Order</th>
                  <th className={thBase}>Customer</th>
                  <th className={thBase}>Total</th>
                  <th className={thBase}>Coupon</th>
                  <th className={thBase}>Status</th>
                  <th className={thBase}>Date</th>
                  <th className={thBase}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className={tdBase} colSpan={7}>Loading…</td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td className={tdBase} colSpan={7}>No orders match your filters.</td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const createdAt = o.createdAt?.toDate
                      ? o.createdAt.toDate()
                      : (o.createdAt ? new Date(o.createdAt) : null);

                    const statusTone =
                      o.status === "delivered" ? "success" :
                      o.status === "cancelled" ? "error" :
                      o.status === "pending" ? "warn" : "neutral";

                    return (
                      <tr key={o.id} className={rowHover}>
                        <td className={tdBase}>
                          <div className="font-medium text-gray-900">{o.id}</div>
                          <div className={subText}>#{(o.orderNumber || "").toString()}</div>
                        </td>
                        <td className={tdBase}>
                          <div className="text-gray-900">{o.customerName || "-"}</div>
                          <div className={subText}>{o.customerEmail || ""}</div>
                        </td>
                        <td className={tdBase}>₹{(o.total || 0).toLocaleString()}</td>
                        <td className={tdBase}>{o.coupon?.code || "—"}</td>
                        <td className={tdBase}>
                          <div className="flex items-center gap-2">
                            <span className={badge(statusTone)}>{o.status}</span>
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                              className="h-8 px-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td className={tdBase}>
                          {createdAt ? createdAt.toLocaleDateString() : "—"}
                        </td>
                        <td className={tdBase}>
                          <div className="flex gap-2">
                            <a
                              href={`/admin/orders/${o.id}`}
                              className={buttonGhost}
                            >
                              View
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
