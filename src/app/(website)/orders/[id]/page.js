"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import toast from "react-hot-toast"
import Link from "next/link"
import { inr } from "@/lib/utils"

export default function OrderDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      toast.error("Please login to view orders")
      router.push("/login")
      return
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        const ref = doc(db, "orders", id)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          toast.error("Order not found")
          router.push("/orders")
          return
        }
        setOrder({ id: snap.id, ...snap.data() })
      } catch (err) {
        console.error(err)
        toast.error("Failed to load order")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchOrder()
  }, [id, user, router])

  if (loading) return <div className="p-10 text-center">Loading order…</div>
  if (!order) return null

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold">Order #{order.orderId}</h1>
          <p className="text-sm text-gray-600">
            Placed on {order.createdAt?.toDate().toLocaleString()}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === "paid"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Customer + Shipping */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="font-medium text-gray-800">Customer</h2>
          <p className="text-sm">{order.customer?.name}</p>
          <p className="text-sm">{order.customer?.email}</p>
          <p className="text-sm">{order.customer?.phone}</p>
        </div>
        <div className="space-y-2">
          <h2 className="font-medium text-gray-800">Shipping Address</h2>
          <p className="text-sm">{order.shipping?.addressLine1}</p>
          {order.shipping?.addressLine2 && (
            <p className="text-sm">{order.shipping.addressLine2}</p>
          )}
          <p className="text-sm">
            {order.shipping?.city}, {order.shipping?.state} -{" "}
            {order.shipping?.pincode}
          </p>
          <p className="text-sm">{order.shipping?.country}</p>
        </div>
      </div>

      {/* Tracking */}
      {order.tracking ? (
        <div className="border rounded-lg p-4 bg-neutral-50">
          <h2 className="font-medium mb-2">Tracking Info</h2>
          <p className="text-sm">Courier: {order.tracking.courier}</p>
          <p className="text-sm">Tracking No: {order.tracking.number}</p>
          <Link
            href={order.tracking.url}
            target="_blank"
            className="text-sm text-brand hover:underline"
          >
            Track Package →
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-neutral-50 text-sm text-gray-600">
          Tracking info will be updated once your order ships.
        </div>
      )}

      {/* Items */}
      <div className="space-y-3">
        <h2 className="font-medium text-gray-800">Items</h2>
        <div className="border rounded-lg divide-y">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-gray-600">Qty: {item.qty}</p>
              </div>
              <p className="font-medium text-sm">
                {inr(item.price * item.qty)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
        <span>Total</span>
        <span>{inr(order.total)}</span>
      </div>
    </div>
  )
}
