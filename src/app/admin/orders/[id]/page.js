"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  card, cardBody, sectionTitle, subText,
  buttonPrimary, buttonGhost,
  tableWrap, tableBase, thBase, tdBase, rowHover, badge
} from "@/components/admin/ui";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const ref = doc(db, "orders", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateDoc(doc(db, "orders", id), { status: newStatus });
      setOrder((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  if (loading) return <p className="p-6">Loading order…</p>;
  if (!order) return <p className="p-6">Order not found.</p>;

  const createdAt = order.createdAt?.toDate
    ? order.createdAt.toDate()
    : (order.createdAt ? new Date(order.createdAt) : null);

  const statusTone =
    order.status === "delivered" ? "success" :
    order.status === "cancelled" ? "error" :
    order.status === "pending" ? "warn" : "neutral";

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Order {order.id}
        </h1>
        <p className={subText}>
          Placed {createdAt ? createdAt.toLocaleDateString() : "—"}
        </p>
      </div>

      {/* Order Summary */}
      <section className={`${card} mb-5`}>
        <div className={cardBody}>
          <h2 className={sectionTitle}>Order Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={badge(statusTone)}>{order.status}</span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  className="h-8 px-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-xs focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                ₹{(order.total || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Coupon</p>
              <p className="text-gray-900 mt-1">
                {order.coupon?.code || "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Info */}
      <section className={`${card} mb-5`}>
        <div className={cardBody}>
          <h2 className={sectionTitle}>Customer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Name</p>
              <p className="text-gray-900">{order.customerName || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-gray-900">{order.customerEmail || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Phone</p>
              <p className="text-gray-900">{order.customerPhone || "—"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping */}
      <section className={`${card} mb-5`}>
        <div className={cardBody}>
          <h2 className={sectionTitle}>Shipping</h2>
          <div className="mt-4">
            <p className="text-gray-900">{order.shippingAddress || "—"}</p>
          </div>
        </div>
      </section>

      {/* Items */}
      <section className={card}>
        <div className={cardBody}>
          <h2 className={sectionTitle}>Items</h2>
          <div className={tableWrap + " mt-4"}>
            <table className={tableBase}>
              <thead>
                <tr>
                  <th className={thBase}>Product</th>
                  <th className={thBase}>Variant</th>
                  <th className={thBase}>Quantity</th>
                  <th className={thBase}>Price</th>
                  <th className={thBase}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, i) => (
                  <tr key={i} className={rowHover}>
                    <td className={tdBase}>{item.productName || item.productCode || "—"}</td>
                    <td className={tdBase}>{item.variant || "—"}</td>
                    <td className={tdBase}>{item.quantity || 1}</td>
                    <td className={tdBase}>₹{(item.price || 0).toLocaleString()}</td>
                    <td className={tdBase}>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <a href="/admin/orders" className={buttonGhost}>
          ← Back to Orders
        </a>
        <button className={buttonPrimary}>
          Print Invoice
        </button>
      </div>
    </div>
  );
}
