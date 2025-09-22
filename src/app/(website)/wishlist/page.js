"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useWishlist } from "@/context/WishlistContext"
import ProductCard from "@/components/product/ProductCard"
import { HeartIcon } from "@heroicons/react/24/outline"

export default function WishlistPage() {
  const { wishlist } = useWishlist()
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(wishlist || [])
  }, [wishlist])

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FDFBED] via-white to-[#f8f6f2] py-16">
      {/* Navbar Spacer */}
      <div className="h-24" />

      <section className="mx-auto max-w-7xl px-4 text-brand-dark">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-playfair text-3xl md:text-4xl">Your Wishlist</h1>
          <p className="mt-3 text-sm text-brand-dark/70">
            Save the pieces you love. Add them to cart anytime.
          </p>
        </div>

        {/* Wishlist Items */}
        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyWishlist />
        )}
      </section>
    </main>
  )
}

function EmptyWishlist() {
  return (
    <div className="mt-16 flex flex-col items-center justify-center rounded-3xl  animate-fadeIn">
      <HeartIcon className="h-16 w-16 text-brand/50 animate-bounce" />
      <h3 className="mt-6 text-lg font-semibold text-brand">Your Wishlist is Empty</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm text-center">
        Start saving your favourite jewelry pieces and find them here anytime.
      </p>
      <Link
        href="/product"
        className="mt-6 rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-dark transition"
      >
        Browse Collection
      </Link>
    </div>
  )
}
