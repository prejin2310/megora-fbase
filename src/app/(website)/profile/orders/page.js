"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore"

import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { inr } from "@/lib/utils"

const statusBadge = (status = "processing") => {
  const normalised = status.toLowerCase()
  if (normalised.includes("delivered")) return "bg-emerald-50 text-emerald-700"
  if (normalised.includes("cancel")) return "bg-rose-50 text-rose-700"
  if (normalised.includes("refund")) return "bg-amber-50 text-amber-700"
  return "bg-sky-50 text-sky-700"
}

export default function ProfileOrdersPage() {
  const { user, initializing } = useAuth() || {}
  const router = useRouter()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/login?redirect=/profile/orders")
    }
  }, [initializing, user, router])

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.uid) {
        setOrders([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const ordersRef = collection(db, "orders")
        const q = query(
          ordersRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(10)
        )
        const snapshot = await getDocs(q)
        const items = snapshot.docs.map((doc) => {
          const data = doc.data()
          const createdAt = data.createdAt?.toDate?.() || null
          const eta = data.delivery?.estimateWindow || data.delivery?.eta || null
          return {
            id: doc.id,
            orderNumber: data.orderNumber || doc.id,
            total: data.charges?.total ?? data.total ?? 0,
            status: (data.status || data.payment?.status || "processing").replace(/_/g, " "),
            createdAt,
            eta,
            tracking: data.tracking || null,
            itemCount: data.items?.length || 0,
          }
        })
        setOrders(items)
      } catch (error) {
        console.error("profile:orders", error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    if (!initializing) {
      loadOrders()
    }
  }, [initializing, user?.uid])

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 pt-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <header className="rounded-3xl bg-white px-6 py-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Orders</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">Order details & tracking</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track live parcels, revisit invoices, and monitor delivery timelines for your recent orders.
          </p>
        </header>

        <section className="mt-8 rounded-3xl bg-white px-6 py-8 shadow-sm">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
              Place your first order to see tracking updates here.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {orders.map((order) => (
                <li key={order.id} className="flex flex-col gap-4 py-5 text-sm text-gray-700 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-gray-900">Order #{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">
                      {order.createdAt ? order.createdAt.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Processing"}
                      {order.eta ? `  ETA ${order.eta}` : ""}
                    </p>
                    <p className="text-xs text-gray-500">{order.itemCount} item{order.itemCount === 1 ? "" : "s"}</p>
                  </div>
                  <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{inr(order.total)}</span>
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 transition hover:bg-emerald-600 hover:text-white"
                    >
                      View
                    </Link>
                    {order.tracking?.url && (
                      <Link
                        href={order.tracking.url}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-gray-600 transition hover:border-emerald-200 hover:text-emerald-600"
                      >
                        Track parcel
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
