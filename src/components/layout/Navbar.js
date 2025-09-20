"use client"

import { Fragment, useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  HeartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import Image from "next/image"
import { subscribeProducts } from "@/lib/db"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { useAuth } from "@/context/AuthContext"

export default function Navbar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [desktopSearch, setDesktopSearch] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)

  const router = useRouter()
  const searchInputRef = useRef(null)

  const { cart } = useCart()
  const { wishlist } = useWishlist()
  const { user } = useAuth()

  // 🔹 Real-time search
  useEffect(() => {
    let unsubscribe
    if (query.length > 1) {
      setLoading(true)
      unsubscribe = subscribeProducts(query, (products) => {
        setResults(products)
        setShowResults(true)
        setLoading(false)
      })
    } else {
      setResults([])
      setShowResults(false)
      setLoading(false)
    }
    return () => unsubscribe && unsubscribe()
  }, [query])

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md shadow">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button onClick={() => router.push("/")} className="flex items-center">
            <Image src="/logoLan.png" alt="Megora" width={110} height={70} />
          </button>

          {/* Search (desktop) */}
          <div className="hidden lg:block relative">
            {!desktopSearch ? (
              <button onClick={() => setDesktopSearch(true)}>
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-700" />
              </button>
            ) : (
              <div className="relative w-80">
                <div className="flex items-center rounded-full bg-white px-3 py-2 shadow">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products by name or SKU..."
                    className="ml-2 w-full outline-none text-gray-700"
                  />
                  <button
                    onClick={() => {
                      setDesktopSearch(false)
                      setQuery("")
                      setShowResults(false)
                    }}
                    className="ml-2 text-gray-400"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {showResults && (
                  <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg z-50 max-h-72 overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="h-5 w-5 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : results.length > 0 ? (
                      results.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            router.push(`/products/${product.handle}`)
                            setShowResults(false)
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 hover:bg-gray-50 border-b text-left"
                        >
                          <Image
                            src={product.media?.[0]?.url || "/demo/product1.jpg"}
                            alt={product.title}
                            width={36}
                            height={36}
                            className="rounded-md"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{product.title}</p>
                            <p className="text-xs text-gray-500">SKU: {product.sku || "N/A"}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">No products found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Mobile search */}
            <button className="lg:hidden" onClick={() => setMobileSearch((p) => !p)}>
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-700" />
            </button>

            {/* Wishlist */}
            <button onClick={() => router.push("/wishlist")} className="relative">
              <HeartIcon className="h-6 w-6 text-gray-700" />
              {wishlist?.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button onClick={() => router.push("/cart")} className="relative flex items-center">
              <ShoppingBagIcon className="h-6 w-6 text-gray-700" />
              {cart?.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-brand-dark text-white text-xs px-1.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Profile */}
            <button onClick={() => router.push(user ? "/profile" : "/auth/login")}>
              <UserCircleIcon className="h-7 w-7 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile search field */}
        {mobileSearch && (
          <div className="mt-1 px-2 pb-2 lg:hidden bg-white shadow rounded-md">
            <div className="flex items-center rounded-md bg-white px-3 py-2">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="ml-2 flex-1 outline-none text-gray-700 text-sm"
              />
            </div>

            {showResults && (
              <div className="mt-2 bg-white shadow-md rounded-md max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="h-5 w-5 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : results.length > 0 ? (
                  results.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        router.push(`/products/${product.handle}`)
                        setShowResults(false)
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2 border-b hover:bg-gray-50 text-left"
                    >
                      <Image
                        src={product.media?.[0]?.url || "/demo/product1.jpg"}
                        alt={product.title}
                        width={32}
                        height={32}
                        className="rounded-md"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{product.title}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku || "N/A"}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500 text-sm">No products</div>
                )}
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
