"use client"

import clsx from "clsx"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import toast from "react-hot-toast"

import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { inr } from "@/lib/utils"

export default function OrdersListPage() {
  const { user, initializing } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (initializing) return

    if (!user) {
      toast.error("Please login to view your orders.")
      router.push("/login?redirect=/orders")
      return
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)
        const customerOrdersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
        const snapshot = await getDocs(customerOrdersQuery)
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setOrders(data)
      } catch (error) {
        console.error("orders:list", error)
        toast.error("We couldn't load your order history. Please retry.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [initializing, router, user])

  if (initializing || loading) {
    return <div className="p-10 text-center text-sm text-gray-600">Loading your ordersâ€¦</div>
  }

  if (!orders.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">No orders yet</h1>
        <p className="mt-3 text-sm text-gray-600">
          When you checkout, your jewellery history will appear right here.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow"
        >
          Discover new pieces
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand/60">Order archive</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">My orders</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <ul className="divide-y divide-gray-100">
          {orders.map((order) => {
            const total = order.charges?.total ?? order.total ?? 0
            const orderDate = order.createdAt?.toDate?.() ?? null
            const formattedDate = orderDate
              ? orderDate.toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Date pending"

            const statusLabel = (order.status || order.payment?.status || "processing").replace(
              /_/g,
              " "
            )

            return (
              <li key={order.id}>
                <Link
                  href={/orders/}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-neutral-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Order #{order.orderNumber || order.id}
                    </p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                    <p className="text-xs text-gray-500">
                      {order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{inr(total)}</p>
                    <span
                      className={clsx(
                        "mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize",
                        statusLabel.toLowerCase().includes("paid") || statusLabel.toLowerCase().includes("process")
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

