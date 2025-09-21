"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { doc, getDoc } from "firebase/firestore"

import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { inr } from "@/lib/utils"

export default function InvoicePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, initializing } = useAuth()

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (initializing) return

    if (!user) {
      toast.error("Please sign in to view invoices.")
      router.push(`/login?redirect=/orders/${id}/invoice`)
      return
    }

    const loadOrder = async () => {
      try {
        setLoading(true)
        const snapshot = await getDoc(doc(db, "orders", id))
        if (!snapshot.exists()) {
          toast.error("Invoice not found.")
          router.push("/orders")
          return
        }
        const data = snapshot.data()
        if (data.userId && data.userId !== user.uid) {
          toast.error("This invoice belongs to another account.")
          router.push("/orders")
          return
        }
        setOrder({ id: snapshot.id, ...data })
      } catch (error) {
        console.error("invoice:load", error)
        toast.error("Unable to load invoice.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadOrder()
    }
  }, [id, initializing, router, user])

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  if (initializing || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-500">Preparing your invoice</p>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const subtotal = order.charges?.subtotal ?? 0
  const baseDelivery = order.charges?.baseDelivery ?? 0
  const expressCharge = order.charges?.expressCharge ?? 0
  const giftCharge = order.charges?.giftWrap ?? 0
  const codCharge = order.charges?.codCharge ?? 0
  const total = order.charges?.total ?? 0

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
        <p key={`${line}-${index}`} className="text-sm text-gray-600">
          {line}
        </p>
      ))

  return (
    <div className="min-h-screen bg-white pb-16">
      <header className="flex flex-col gap-6 border-b border-gray-200 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-16">
        <div className="flex items-center gap-4">
          <Image src="/logoLan.png" alt="Megora" width={140} height={60} />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tax Invoice</h1>
            <p className="text-xs uppercase tracking-[0.35em] text-brand/60">Megora Jewels Private Limited</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand"
          >
            Print Save PDF
          </button>
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-brand/20 px-5 py-2 text-sm font-medium text-brand transition hover:bg-brand/10"
          >
            Back to order
          </Link>
        </div>
      </header>

      <main className="mx-auto mt-10 max-w-5xl px-6 lg:px-16">
        <section className="grid gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-brand/70">Invoice Details</h2>
            <p className="text-sm text-gray-600">
              Invoice #: <span className="font-medium text-gray-900">{order.orderNumber || order.id}</span>
            </p>
            <p className="text-sm text-gray-600">
              Date: <span className="font-medium text-gray-900">{order.createdAt?.toDate?.().toLocaleDateString() || "Processing"}</span>
            </p>
            {order.payment?.method && (
              <p className="text-sm text-gray-600">
                Payment method: <span className="font-medium text-gray-900">{order.payment.method.toUpperCase()}</span>
              </p>
            )}
            {order.payment?.status && (
              <p className="text-sm text-gray-600">
                Status: <span className="font-medium capitalize text-gray-900">{order.payment.status.replace(/_/g, " ")}</span>
              </p>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-brand/70">Bill to</h3>
              {addressLines(order.billingSameAsShipping ? order.shipping : order.billing)}
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-brand/70">Ship to</h3>
              {addressLines(order.shipping)}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <table className="w-full table-fixed text-sm text-gray-700">
            <thead className="border-b border-gray-100 text-left text-xs uppercase tracking-[0.25em] text-gray-500">
              <tr>
                <th className="pb-3">Item</th>
                <th className="pb-3">Qty</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items?.map((item, index) => (
                <tr key={`${item.id}-${index}`} className="align-top">
                  <td className="py-4">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    {item.variant && <p className="text-xs text-gray-500">Variant: {item.variant}</p>}
                  </td>
                  <td className="py-4">{item.qty}</td>
                  <td className="py-4">{inr(Number(item.price || 0))}</td>
                  <td className="py-4">{inr(Number(item.price || 0) * Number(item.qty || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex flex-col gap-2 text-sm text-gray-600 lg:items-end">
            <div className="w-full max-w-xs border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{inr(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{baseDelivery === 0 ? "Complimentary" : inr(baseDelivery)}</span>
              </div>
              {expressCharge > 0 && (
                <div className="flex justify-between">
                  <span>Express upgrade</span>
                  <span>{inr(expressCharge)}</span>
                </div>
              )}
              {giftCharge > 0 && (
                <div className="flex justify-between">
                  <span>Gift wrap</span>
                  <span>{inr(giftCharge)}</span>
                </div>
              )}
              {codCharge > 0 && (
                <div className="flex justify-between">
                  <span>COD handling</span>
                  <span>{inr(codCharge)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-4 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{inr(total)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-brand/70">Notes</h2>
          <p className="mt-3 text-sm text-gray-600">
            Thank you for choosing Megora. Every jewel is handcrafted and inspected by our atelier before dispatch. For care tips or concierge support, write to care@megora.in.
          </p>
        </section>
      </main>
    </div>
  )
}
