"use client"

import clsx from "clsx"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import toast from "react-hot-toast"

import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { inr } from "@/lib/utils"
import { doc, getDoc } from "firebase/firestore"

const formatDateTime = (value) => {
  if (!value?.toDate) return "Date pending"
  const date = value.toDate()
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function OrderDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, initializing } = useAuth()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (initializing) return

    if (!user) {
      toast.error("Please login to view your orders.")
      router.push(`/login?redirect=/orders/${id}`)
      return
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        const ref = doc(db, "orders", id)
        const snapshot = await getDoc(ref)
        if (!snapshot.exists()) {
          toast.error("We couldn't find that order.")
          router.push("/orders")
          return
        }
        const data = snapshot.data()
        if (data.userId && data.userId !== user.uid) {
          toast.error("That order belongs to another account.")
          router.push("/orders")
          return
        }
        setOrder({ id: snapshot.id, ...data })
      } catch (error) {
        console.error("orders:detail", error)
        toast.error("Unable to load your order. Please retry.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchOrder()
    }
  }, [id, initializing, router, user])

  if (initializing || loading) {
    return <div className="p-10 text-center text-sm text-gray-600">Loading order details�</div>
  }

  if (!order) {
    return null
  }

  const total = order.charges?.total ?? order.total ?? 0
  const subtotal = order.charges?.subtotal ?? total
  const paymentStatus = (order.payment?.status || order.status || "processing").replace(
    /_/g,
    " "
  )

  const addressLines = (address) =>
    [
      address?.fullName,
      address?.addressLine1,
      address?.addressLine2,
      [address?.city, address?.state, address?.pincode].filter(Boolean).join(", "),
      address?.country,
    ]
      .filter(Boolean)
      .map((line, index) => (
        <p key={`${line}-${index}`} className="text-sm text-gray-700">
          {line}
        </p>
      ))

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand/60">Order reference</p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">
            Order #{order.orderNumber || order.id}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={clsx(
              "inline-flex items-center rounded-full px-4 py-1 text-sm font-medium capitalize",
              paymentStatus.toLowerCase().includes("paid") || paymentStatus.toLowerCase().includes("process")
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            )}
          >
            {paymentStatus}
          </span>
          <Link
            href="/orders"
            className="inline-flex items-center rounded-full border border-brand/20 px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/10"
          >
            Back to orders
          </Link>
          <Link
            href={`/orders/${order.id}/invoice`}
            className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-brand/40 hover:text-brand"
          >
            View invoice
          </Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Contact & shipping</h2>
          <div className="mt-4 space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-medium text-gray-900">Contact</p>
              <p>{order.contact?.email || "Email unavailable"}</p>
              <p>{order.contact?.phone || "Phone unavailable"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Ship to</p>
              {addressLines(order.shipping)}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Billing & delivery</h2>
          <div className="mt-4 space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-medium text-gray-900">Billing address</p>
              {order.billingSameAsShipping ? (
                <p className="text-sm text-gray-600">Same as shipping</p>
              ) : (
                addressLines(order.billing)
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">Delivery preference</p>
              <p>
                {order.delivery?.label || "Standard delivery"}
                {order.delivery?.eta ? ` � ${order.delivery.eta}` : ""}
              </p>
              {order.delivery?.expressCharge ? (
                <p className="text-xs text-gray-500">
                  Express surcharge: {inr(order.delivery.expressCharge)}
                </p>
              ) : null}
              {order.giftWrap && (
                <p className="text-xs text-gray-500">Includes personalised gift wrap.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {order.tracking ? (
        <section className="rounded-2xl border border-brand/10 bg-brand/5 p-6 text-sm text-brand">
          <h2 className="text-lg font-semibold text-brand">Tracking details</h2>
          <p className="mt-2">Courier: {order.tracking.courier}</p>
          <p>Tracking number: {order.tracking.number}</p>
          {order.tracking.url && (
            <Link href={order.tracking.url} target="_blank" className="mt-2 inline-flex text-sm font-semibold">
              Track parcel ?
            </Link>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-600">
          Tracking information will appear once your parcel leaves our studio.
        </section>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Items</h2>
        <ul className="mt-4 divide-y divide-gray-100 text-sm text-gray-700">
          {order.items?.map((item, index) => (
            <li key={`${item.id}-${index}`} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">
                  Qty {item.qty} � {item.variant || "Default"}
                </p>
              </div>
              <p className="font-medium">{inr(Number(item.price || 0) * Number(item.qty || 1))}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-sm text-gray-700">
        <h2 className="text-lg font-semibold text-gray-900">Payment summary</h2>
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{inr(subtotal)}</dd>
          </div>
          {order.charges?.baseDelivery ? (
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{inr(order.charges.baseDelivery)}</dd>
            </div>
          ) : null}
          {order.charges?.expressCharge ? (
            <div className="flex justify-between">
              <dt>Express upgrade</dt>
              <dd>{inr(order.charges.expressCharge)}</dd>
            </div>
          ) : null}
          {order.charges?.giftWrap ? (
            <div className="flex justify-between">
              <dt>Gift wrap</dt>
              <dd>{inr(order.charges.giftWrap)}</dd>
            </div>
          ) : null}
          {order.charges?.codCharge ? (
            <div className="flex justify-between">
              <dt>COD handling</dt>
              <dd>{inr(order.charges.codCharge)}</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-semibold text-gray-900">
          <span>Total paid</span>
          <span>{inr(total)}</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Payment method: {order.payment?.method?.toUpperCase() || "Not available"}
          {order.payment?.razorpayPaymentId ? ` � Transaction ${order.payment.razorpayPaymentId}` : ""}
        </p>
      </section>
    </div>
  )
}

