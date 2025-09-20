"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import toast from "react-hot-toast"
import Link from "next/link"
import { inr } from "@/lib/utils"

export default function OrdersListPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      toast.error("Please login to view orders")
      router.push("/login")
      return
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
        const snap = await getDocs(q)
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setOrders(data)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load orders")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user, router])

  if (loading) return <div className="p-10 text-center">Loading orders…</div>
  if (!orders.length) return <div className="p-10 text-center">No orders yet.</div>

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">My Orders</h1>

      <div className="border rounded-lg divide-y">
        {orders.map((order) => (
          <Link
            href={`/orders/${order.id}`}
            key={order.id}
            className="flex items-center justify-between p-4 hover:bg-neutral-50 transition"
          >
            <div>
              <p className="font-medium">
                Order #{order.orderId || order.id}
              </p>
              <p className="text-sm text-gray-600">
                {order.createdAt?.toDate().toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {order.items.length} items
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{inr(order.total)}</p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === "paid"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {order.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
