"use client"

import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"

export default function OrderSuccessPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const txn = searchParams.get("txn")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-emerald-600">🎉 Order Confirmed!</h1>
        <p className="mt-3 text-gray-700">Thank you for your purchase.</p>
        <p className="mt-1 text-sm text-gray-500">Your order ID is <span className="font-medium">{id}</span></p>
        {txn && (
          <p className="mt-1 text-sm text-gray-500">
            Transaction ID: <span className="font-medium">{txn}</span>
          </p>
        )}
        <Link
          href="/"
          className="mt-6 inline-block bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-dark transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
