"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRightIcon,
  HeartIcon,
  KeyIcon,
  MapPinIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore"

import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { db } from "@/lib/firebase"
import { inr } from "@/lib/utils"

const dashboardLinks = [
  {
    title: "Account details",
    description: "Update your name and contact preferences in seconds.",
    href: "/profile/account",
    icon: UserCircleIcon,
  },
  {
    title: "Password & security",
    description: "Send a password reset and keep your account safe.",
    href: "/profile/password",
    icon: KeyIcon,
  },
  {
    title: "Orders & tracking",
    description: "Monitor current parcels and download invoices.",
    href: "/profile/orders",
    icon: TruckIcon,
  },
  {
    title: "Purchase history",
    description: "Browse every jewel you have added to your trove.",
    href: "/profile/history",
    icon: ShoppingBagIcon,
  },
  {
    title: "Wishlist & cart",
    description: "Review favourites and pieces waiting in your bag.",
    href: "/profile/wishlist",
    icon: HeartIcon,
  },
  {
    title: "Saved addresses",
    description: "Store delivery addresses for faster checkout.",
    href: "/profile/addresses",
    icon: MapPinIcon,
  },
]

const formatName = (value = "") => {
  if (!value) return "Guest"
  return value
    .replace(/[._-]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

export default function ProfilePage() {
  const { user = null, initializing = true } = useAuth() || {}
  const router = useRouter()
  const { cart = [] } = useCart() || {}
  const { wishlist = [] } = useWishlist() || {}

  const [recentOrders, setRecentOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/login?redirect=/profile")
    }
  }, [initializing, user, router])

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!user?.uid) {
        setRecentOrders([])
        setOrdersLoading(false)
        return
      }

      try {
        setOrdersLoading(true)
        const ordersRef = collection(db, "orders")
        const ordersQuery = query(
          ordersRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        )
        const snapshot = await getDocs(ordersQuery)
        const orders = snapshot.docs.map((doc) => {
          const data = doc.data()
          const createdAt = data.createdAt?.toDate?.() || null
          return {
            id: doc.id,
            orderNumber: data.orderNumber,
            total: data.charges?.total ?? data.total ?? 0,
            status: data.status || data.payment?.status || "processing",
            createdAt,
            eta: data.delivery?.estimateWindow || data.delivery?.eta || null,
          }
        })
        setRecentOrders(orders)
      } catch (error) {
        console.error("profile:orders", error)
        setRecentOrders([])
      } finally {
        setOrdersLoading(false)
      }
    }

    if (!initializing) {
      fetchRecentOrders()
    }
  }, [initializing, user?.uid])

  const joinDate = useMemo(() => {
    if (!user?.metadata?.creationTime) return null
    const parsed = new Date(user.metadata.creationTime)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    })
  }, [user])

  const displayName = useMemo(() => {
    if (user?.displayName) return user.displayName
    if (user?.email) return formatName(user.email.split("@")[0])
    return "Guest"
  }, [user?.displayName, user?.email])

  if (initializing || !user) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-28">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl bg-white/90 px-6 py-10 shadow-sm">
            <p className="text-sm text-gray-500">Preparing your profile</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 pt-28">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <section className="rounded-3xl bg-white px-6 py-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Your profile</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">Hi {displayName}, welcome back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add your full name so we can personalise every invoice and delivery experience.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/profile/account"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Update your name
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/profile/orders"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-200 hover:text-emerald-700"
            >
              View recent orders
            </Link>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Member since</dt>
              <dd className="mt-1 text-sm text-gray-800">{joinDate || ""}</dd>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Wishlist</dt>
              <dd className="mt-1 text-sm text-gray-800">{wishlist.length} item{wishlist.length === 1 ? "" : "s"}</dd>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Cart</dt>
              <dd className="mt-1 text-sm text-gray-800">{cart.length} item{cart.length === 1 ? "" : "s"}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {dashboardLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="group flex h-full items-start gap-4 rounded-3xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <link.icon className="h-5 w-5" />
              </span>
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-semibold text-gray-900">{link.title}</p>
                <p className="mt-1 text-xs text-gray-600">{link.description}</p>
                <span className="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 opacity-0 transition group-hover:opacity-100">
                  Manage <ArrowRightIcon className="ml-2 h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-600"
            >
              See all orders
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 rounded-3xl border border-gray-200 bg-white px-4 py-5 shadow-sm">
            {ordersLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-12 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-gray-600">We will list your orders here once you place one.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex flex-col gap-2 py-4 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.orderNumber || order.id}</p>
                      <p className="text-xs text-gray-500">
                        {order.createdAt ? order.createdAt.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "Processing"}
                        {order.eta ? `  ETA ${order.eta}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                        {order.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{inr(order.total)}</span>
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 hover:text-emerald-500"
                      >
                        View
                        <ArrowRightIcon className="h-3 w-3" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
