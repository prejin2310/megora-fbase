"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function OrderDetailPage() {
  const { id } = useParams(); // order id from URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const ref = doc(db, "orders", id);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setOrder({ id: snapshot.id, ...snapshot.data() });
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      const ref = doc(db, "orders", id);
      await updateDoc(ref, { status: newStatus, updatedAt: new Date().toISOString() });
      setOrder((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="p-4">Loading order...</p>;
  if (!order) return <p className="p-4">Order not found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>

      {/* Customer Info */}
      <div className="border p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Customer</h2>
        <p><strong>Name:</strong> {order.customerName || "Guest"}</p>
        <p><strong>Email:</strong> {order.customerEmail || "-"}</p>
        <p><strong>Phone:</strong> {order.customerPhone || "-"}</p>
      </div>

      {/* Shipping Address */}
      <div className="border p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
        {order.shippingAddress ? (
          <p>
            {order.shippingAddress.line1}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.state} - {order.shippingAddress.zip}
          </p>
        ) : (
          <p>-</p>
        )}
      </div>

      {/* Payment Info */}
      <div className="border p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Payment</h2>
        <p><strong>Method:</strong> {order.paymentMethod || "COD"}</p>
        <p><strong>Total:</strong> ₹{order.total || 0}</p>
      </div>

      {/* Items */}
      <div className="border p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Items</h2>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Variant</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx}>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">{item.variant || "-"}</td>
                <td className="p-2 border">{item.quantity}</td>
                <td className="p-2 border">₹{item.price}</td>
                <td className="p-2 border">₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status */}
      <div className="border p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Order Status</h2>
        <p className="mb-2">
          Current:{" "}
          <span
            className={`px-2 py-1 rounded text-sm ${
              order.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : order.status === "shipped"
                ? "bg-blue-100 text-blue-800"
                : order.status === "delivered"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {order.status}
          </span>
        </p>

        <div className="flex space-x-2">
          {["pending", "shipped", "delivered", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusUpdate(s)}
              disabled={updating || order.status === s}
              className={`px-3 py-1 border rounded ${
                order.status === s ? "bg-gray-300" : "hover:bg-gray-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
