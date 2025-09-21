"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { inr } from "@/lib/utils"

const ItemList = ({ title, items, emptyLabel, actionLabel, actionHref }) => (
  <section className="rounded-3xl bg-white px-6 py-6 shadow-sm">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {items.length > 0 && actionHref && (
        <Link className="text-sm font-semibold text-emerald-600 hover:text-emerald-500" href={actionHref}>
          {actionLabel}
        </Link>
      )}
    </div>
    {items.length === 0 ? (
      <p className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-600">
        {emptyLabel}
      </p>
    ) : (
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">{item.title}</p>
              {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{inr(item.price || 0)}</p>
              {item.qty && <p className="text-xs text-gray-500">Qty {item.qty}</p>}
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
)

export default function WishlistCartPage() {
  const { user, initializing } = useAuth() || {}
  const router = useRouter()
  const { wishlist = [] } = useWishlist() || {}
  const { cart = [] } = useCart() || {}

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/login?redirect=/profile/wishlist")
    }
  }, [initializing, user, router])

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 pt-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <header className="rounded-3xl bg-white px-6 py-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Collections</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">Wishlist & cart</h1>
          <p className="mt-2 text-sm text-gray-600">
            Keep an eye on treasures you love and pieces waiting for checkout. Items sync across devices when you are logged in.
          </p>
        </header>

        <div className="mt-8 grid gap-6">
          <ItemList
            title="Wishlist"
            items={wishlist}
            emptyLabel="Your wishlist is empty. Explore the collections and tap the heart icon to save favourites."
            actionLabel="Browse jewellery"
            actionHref="/products"
          />
          <ItemList
            title="Cart"
            items={cart}
            emptyLabel="Your cart is feeling light. Add a jewel and return here to checkout."
            actionLabel="Go to checkout"
            actionHref={cart.length > 0 ? "/checkout" : "/products"}
          />
        </div>
      </div>
    </div>
  )
}
