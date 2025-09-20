"use client"

import { Fragment, useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react"
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  HeartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { subscribeProducts } from "@/lib/db"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [currency, setCurrency] = useState("INR")
  const [mobileSearch, setMobileSearch] = useState(false)
  const [desktopSearch, setDesktopSearch] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { cart } = useCart()
  const { wishlist } = useWishlist()
  const pathname = usePathname()
  const searchInputRef = useRef(null)

  // Scroll effect (40% viewport height)
  useEffect(() => {
    const handleScroll = () => {
      const triggerHeight = window.innerHeight * 0.4
      setScrolled(window.scrollY > triggerHeight)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Real-time search
  useEffect(() => {
    if (query.length > 1) {
      const unsubscribe = subscribeProducts(query, (products) => {
        setResults(products)
        setShowResults(true)
      })
      return () => unsubscribe()
    } else {
      setResults([])
      setShowResults(false)
    }
  }, [query])

  const toggleCurrency = () =>
    setCurrency((prev) => (prev === "INR" ? "USD" : "INR"))

  // ✅ Navbar background logic
  const isHome = pathname === "/"
  const navbarBg =
    isHome && !scrolled
      ? "bg-transparent backdrop-blur-0"
      : "bg-brand/95 backdrop-blur-md shadow-lg"

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${navbarBg}`}
    >
      {/* Free shipping bar */}
      <p
        className={`flex h-10 items-center justify-center px-4 text-sm font-medium transition-all duration-500 ${
          isHome && !scrolled
            ? "bg-white/60 text-brand backdrop-blur-md"
            : "bg-white text-brand"
        }`}
      >
        Free Shipping on All Orders Above ₹599
      </p>

      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Left */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-md p-2 text-white lg:hidden transition-colors duration-300"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link
              href="/"
              className="ml-2 flex items-center transition-transform duration-500 hover:scale-105"
            >
              <Image src="/logoLan.png" alt="Megora" width={120} height={80} />
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-4">
            {/* Currency toggle */}
            <div className="hidden lg:flex cursor-pointer" onClick={toggleCurrency}>
              <span className="ml-2 text-sm text-white">{currency}</span>
            </div>

            {/* Desktop search */}
            {!desktopSearch ? (
              <button
                className="hidden lg:block text-white"
                onClick={() => setDesktopSearch(true)}
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
            ) : (
              <div className="hidden lg:block relative w-80">
                <div className="flex items-center rounded-full bg-white/90 px-4 py-2 shadow-md backdrop-blur-md transition-all duration-500">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="ml-2 w-full bg-transparent outline-none text-gray-700"
                  />
                  <button
                    onClick={() => {
                      setDesktopSearch(false)
                      setQuery("")
                      setShowResults(false)
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Search results */}
                {showResults && (
                  <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg z-50 max-h-72 overflow-y-auto transition-all duration-300">
                    {results.length > 0 ? (
                      results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.handle || product.slug}`}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 border-b"
                          onClick={() => setShowResults(false)}
                        >
                          <Image
                            src={product.media?.[0]?.url || "/demo/product1.jpg"}
                            alt={product.title}
                            width={40}
                            height={40}
                            className="rounded-md"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{product.title}</p>
                            <p className="text-xs text-gray-500">SKU: {product.sku || "N/A"}</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No products found</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mobile search */}
            <button
              className="lg:hidden text-white"
              onClick={() => setMobileSearch((p) => !p)}
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative">
              <HeartIcon className="h-6 w-6 text-white hover:text-gray-200 transition-colors duration-300" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-xs rounded-full px-1">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative flex items-center text-white">
              <ShoppingBagIcon className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-yellow-500 text-xs rounded-full px-1">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link href="/profile">
              <UserCircleIcon className="h-7 w-7 text-white hover:text-gray-200 transition-colors duration-300" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
