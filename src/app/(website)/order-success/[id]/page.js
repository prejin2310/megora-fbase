"use client"

import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"

export default function OrderSuccessPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const txn = searchParams.get("txn")

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-emerald-600">Order confirmed</h1>
        <p className="mt-3 text-sm text-gray-600">
          Thank you for choosing Megora. We&apos;ve shared your order details over email.
        </p>
        <p className="mt-4 text-sm text-gray-800">
          Order ID: <span className="font-mono font-semibold text-gray-900">{id}</span>
        </p>
        {txn && (
          <p className="mt-1 text-xs text-gray-500">
            Transaction reference: <span className="font-mono">{txn}</span>
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/orders/${id}`}
            className="inline-flex items-center justify-center rounded-full border border-brand/20 px-6 py-3 text-sm font-semibold text-brand transition hover:bg-brand/10"
          >
            View order status
          </Link>
          <Link
            href={`/orders/${id}/invoice`}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition hover:border-brand/40 hover:text-brand"
          >
            Download invoice
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-brand/90"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

