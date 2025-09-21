"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"

import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { inr } from "@/lib/utils"

const groupByYear = (orders = []) => {
  return orders.reduce((acc, order) => {
    const year = order.createdAt?.getFullYear() || "Upcoming"
    if (!acc[year]) acc[year] = []
    acc[year].push(order)
    return acc
  }, {})
}

export default function PurchaseHistoryPage() {
  const { user, initializing } = useAuth() || {}
  const router = useRouter()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/login?redirect=/profile/history")
    }
  }, [initializing, user, router])

  useEffect(() => {
    const loadAllOrders = async () => {
      if (!user?.uid) {
        setOrders([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const ordersRef = collection(db, "orders")
        const q = query(ordersRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        const items = snapshot.docs.map((doc) => {
          const data = doc.data()
          const createdAt = data.createdAt?.toDate?.() || null
          return {
            id: doc.id,
            orderNumber: data.orderNumber || doc.id,
            total: data.charges?.total ?? data.total ?? 0,
            createdAt,
            itemCount: data.items?.length || 0,
            status: (data.status || data.payment?.status || "processing").replace(/_/g, " "),
          }
        })
        setOrders(items)
      } catch (error) {
        console.error("profile:history", error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    if (!initializing) {
      loadAllOrders()
    }
  }, [initializing, user?.uid])

  const grouped = useMemo(() => groupByYear(orders), [orders])
  const years = useMemo(() => {
    const keys = Object.keys(grouped)
    return keys.sort((a, b) => {
      const numA = Number(a)
      const numB = Number(b)
      const aIsNumber = !Number.isNaN(numA)
      const bIsNumber = !Number.isNaN(numB)
      if (aIsNumber && bIsNumber) return numB - numA
      if (aIsNumber) return -1
      if (bIsNumber) return 1
      return a.localeCompare(b)
    })
  }, [grouped])

  const totalSpend = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total || 0), 0), [orders])

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 pt-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <header className="rounded-3xl bg-white px-6 py-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Purchase history</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">Your Megora archive</h1>
          <p className="mt-2 text-sm text-gray-600">
            A timeline of every handcrafted jewel you have collected, complete with totals and order links.
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Total spend</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">{inr(totalSpend)}</dd>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Orders</dt>
              <dd className="mt-1 text-sm text-gray-800">{orders.length}</dd>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Items</dt>
              <dd className="mt-1 text-sm text-gray-800">{orders.reduce((sum, order) => sum + order.itemCount, 0)}</dd>
            </div>
          </dl>
        </header>

        <section className="mt-8 space-y-8">
          {loading ? (
            <div className="rounded-3xl bg-white px-6 py-8 shadow-sm">
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-12 animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl bg-white px-6 py-8 text-sm text-gray-600 shadow-sm">
              You have not placed any orders yet. Browse the <Link className="text-emerald-600" href="/products">collections</Link> to begin.
            </div>
          ) : (
            years.map((year) => (
              <div key={year} className="rounded-3xl bg-white px-6 py-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{year}</h2>
                  <span className="text-xs text-gray-500">{grouped[year].length} order{grouped[year].length === 1 ? "" : "s"}</span>
                </div>
                <ul className="mt-4 space-y-4">
                  {grouped[year].map((order) => (
                    <li key={order.id} className="flex flex-col gap-2 rounded-2xl border border-gray-100 px-4 py-4 text-sm text-gray-700 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">
                          {order.createdAt ? order.createdAt.toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" }) : "Processing"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                          {order.status}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{inr(order.total)}</span>
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 hover:text-emerald-500"
                        >
                          View order
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  )
}




