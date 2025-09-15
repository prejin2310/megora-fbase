"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

export default function CustomerDetailPage() {
  const { id } = useParams(); // customer id
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerAndOrders = async () => {
      try {
        // Fetch customer profile
        const ref = doc(db, "customers", id);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setCustomer({ id: snapshot.id, ...snapshot.data() });

          // Fetch orders for this customer
          const ordersRef = collection(db, "orders");
          const q = query(ordersRef, where("customerId", "==", id));
          const ordersSnap = await getDocs(q);
          const ordersList = ordersSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(ordersList);
        } else {
          setCustomer(null);
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomerAndOrders();
  }, [id]);

  if (loading) return <p className="p-4">Loading customer...</p>;
  if (!customer) return <p className="p-4">Customer not found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Details</h1>

      {/* Profile */}
      <div className="border p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Profile</h2>
        <p><strong>Name:</strong> {customer.name || "-"}</p>
        <p><strong>Email:</strong> {customer.email || "-"}</p>
        <p><strong>Phone:</strong> {customer.phone || "-"}</p>
        <p>
          <strong>Joined:</strong>{" "}
          {customer.createdAt
            ? new Date(customer.createdAt).toLocaleDateString()
            : "-"}
        </p>
      </div>

      {/* Orders */}
      <div className="border p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Orders</h2>
        {orders.length === 0 ? (
          <p>No orders found for this customer.</p>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Order ID</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="p-2 border">{order.id}</td>
                  <td className="p-2 border">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2 border">
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
                  </td>
                  <td className="p-2 border">₹{order.total || 0}</td>
                  <td className="p-2 border">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
