"use client"

import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/context/CartContext"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart()

  const getPrice = (item) =>
    item.variant?.prices?.INR ??
    item.variant?.option?.priceINR ??
    item.priceINR ??
    item.price ??
    0

  const getVariantLabel = (item) =>
    item.variant?.option?.title || item.variant?.attributes?.size || null

  const getLineTotal = (item) => getPrice(item) * (item.qty ?? item.quantity ?? 1)

  const total = cart.reduce((sum, item) => sum + getLineTotal(item), 0)

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-emerald-50 pt-36 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-brand">Your Cart</h1>
          <p className="mt-4 text-lg text-gray-600">Your cart is empty.</p>
          <Link
            href="/collections"
            className="mt-8 inline-block rounded-full bg-brand px-8 py-3 text-white text-sm font-medium shadow-md hover:shadow-lg hover:bg-brand/90 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-emerald-50 pt-36 pb-32 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-brand mb-10">Shopping Cart</h1>

        <div className="space-y-6">
          {cart.map((item) => (
            <div
              key={item.id + (item.variant?.id || "")}
              className="flex items-center gap-6 rounded-2xl border border-brand/10 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:shadow-md"
            >
              {/* Image */}
              <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={item.image || "/demo/product1.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1">
                <p className="text-base font-semibold text-brand">{item.title}</p>
                {getVariantLabel(item) && (
                  <p className="text-sm text-gray-600">{getVariantLabel(item)}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">₹{getPrice(item)}</p>

                {/* Quantity Controls */}
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-gray-300 shadow-sm">
                    <button
                      onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, (item.qty ?? item.quantity ?? 1) - 1),
                            item.variant
                          )
                        }
                      className="px-3 py-1 text-lg font-medium text-gray-600 hover:text-brand"
                    >
                      –
                    </button>
                    <span className="w-10 text-center text-sm font-medium">
                      {item.qty ?? item.quantity ?? 1}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          (item.qty ?? item.quantity ?? 1) + 1,
                          item.variant
                        )
                      }
                      className="px-3 py-1 text-lg font-medium text-gray-600 hover:text-brand"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.variant)}
                    className="text-sm font-medium text-red-500 hover:text-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Line total */}
              <div className="hidden sm:block text-right font-semibold text-brand">
                ₹{getLineTotal(item).toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Summary */}
        <div className="hidden sm:block mt-12 rounded-2xl border border-brand/10 bg-white/80 p-6 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between text-lg font-semibold text-brand">
            <span>Subtotal</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Shipping calculated at checkout. Free for orders above ₹599.
          </p>
          <div className="mt-6 flex gap-4">
            <Link
              href="/collections"
              className="flex-1 rounded-full border border-brand/20 bg-white px-6 py-3 text-center text-sm font-medium text-brand shadow-sm hover:bg-brand/5 transition"
            >
              Continue Shopping
            </Link>
            <Link
              href="/checkout"
              className="flex-1 rounded-full bg-brand px-6 py-3 text-center text-sm font-medium text-white shadow-md hover:shadow-lg hover:bg-brand/90 transition"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar (Mobile) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-xl p-4 z-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="text-lg font-semibold text-brand">
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>
        <Link
          href="/checkout"
          className="block w-full rounded-full bg-brand px-6 py-3 text-center text-sm font-medium text-white shadow-md hover:shadow-lg hover:bg-brand/90 transition"
        >
          Checkout
        </Link>
      </div>
    </div>
  )
}
