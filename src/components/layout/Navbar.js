"use client"

import { Fragment, useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react"
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  HeartIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { subscribeProducts } from "@/lib/db"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { useAuth } from "@/context/AuthContext"
import { logoutUser } from "@/lib/auth"

const curatedSearches = [
  {
    title: "Rental Available Now",
    subtitle: "Indulge in fine jewelry, now available to rent for your special moments.",
    query: "bridal set",
    badge: "Rental Luxe",
    accent: "from-amber-100 via-white to-rose-100",
  },
  {
    title: "Anti-Tarnish Products",
    subtitle: "Advanced anti-tarnish jewelry, Coming Soon",
    query: "necklace",
    badge: "Forever Shine",
    accent: "from-emerald-100 via-white to-slate-100",
  },
  {
    title: "Stone Stories",
    subtitle: "Emeralds, rubies & sapphires that sparkle",
    query: "gemstone",
    badge: "Gem Muse",
    accent: "from-sky-100 via-white to-indigo-100",
  },
]

const trendingSearches = [
  "AD Stone",
  "Anti Tarnish",
  "Necklace",
  "Bridal Combo",
  "Haram",
]

const editorialHighlights = [
  {
    title: "Upcoming Diwali Sale",
    copy: "Celebrate the festival of lights with exclusive festive offers.",
    href: "#",
  },
  {
    title: "Heritage Glow",
    copy: "Uncover timeless traditions and designs reimagined for today.",
    href: "#",
  },
]

const DEFAULT_AVATAR = "https://res.cloudinary.com/dxlfzftq9/image/upload/v1758568751/av2_xvv17q.png";

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [currency, setCurrency] = useState("INR")
  const [scrolled, setScrolled] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // ✅ Safe destructuring with fallback
  const { cart = [] } = useCart() || {}
  const { wishlist = [] } = useWishlist() || {}

  const auth = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const searchInputRef = useRef(null)
  const profileMenuRef = useRef(null)
  const user = auth?.user || null
  const authLoading = auth?.initializing ?? false
  // Derive display name, first name and initial for friendly avatar
  const displayNameFull = (user?.displayName || user?.email || "").toString()
  const firstName = displayNameFull ? displayNameFull.split(" ")[0] : ""
  const firstInitial = firstName ? firstName.trim().charAt(0).toUpperCase() : "U"
  const sanitizedQuery = query.trim()
  const hasQuery = sanitizedQuery.length >= 2

  const escapeRegExp = (value) =>
    value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")

  const highlightMatch = (text = "") => {
    if (!hasQuery || !text) return text
    const regex = new RegExp(`(${escapeRegExp(sanitizedQuery)})`, "ig")
    const lower = sanitizedQuery.toLowerCase()
    return text.split(regex).map((segment, index) =>
      segment.toLowerCase() === lower ? (
        <span key={index} className="text-brand font-semibold">
          {segment}
        </span>
      ) : (
        <Fragment key={index}>{segment}</Fragment>
      )
    )
  }

  const getProductImage = (item = {}) =>
    item.media?.[0]?.url ||
    item.images?.[0]?.url ||
    item.imageUrl ||
    item.featuredImage ||
    item.coverImage ||
    "/demo/product1.jpg"

  const getProductSubtitle = (item = {}) => {
    const raw = item.subtitle || item.shortDescription || item.description || ""
    if (!raw) return null
    const clean = String(raw).replace(/<[^>]+>/g, "").trim()
    if (!clean) return null
    return clean.length > 80 ? `${clean.slice(0, 77)}…` : clean
  }

  const formatPrice = (item = {}) => {
    const value =
      item.prices?.[currency] ??
      item.price?.[currency] ??
      item.priceByCurrency?.[currency] ??
      item[`price${currency}`] ??
      item.priceINR ??
      item.price ??
      item.mrp ??
      item.salePrice ??
      null

    if (!value) return null

    try {
      return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "INR" ? 0 : 2,
      }).format(Number(value))
    } catch (error) {
      return `${currency} ${value}`
    }
  }

  const resolveProductHref = (item = {}) => {
    const slug = item.handle || item.slug || item.permalink || item.id
    return slug ? `/product/${slug}` : "/collections"
  }

  const showEmptyState = hasQuery && !searchLoading && results.length === 0

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
    if (!searchOpen) return
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    const unsubscribe = subscribeProducts(trimmed, (products) => {
      setResults(products)
      setSearchLoading(false)
    })
    return () => unsubscribe()
  }, [query, searchOpen])

  useEffect(() => {
    if (!searchOpen) return
    const timeout = window.setTimeout(() => {
      searchInputRef.current?.focus()
    }, 60)
    return () => window.clearTimeout(timeout)
  }, [searchOpen])

  const toggleCurrency = () =>
    setCurrency((prev) => (prev === "INR" ? "USD" : "INR"))

  const openSearch = () => setSearchOpen(true)

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery("")
    setResults([])
    setSearchLoading(false)
  }

  // Close profile menu on outside click
  useEffect(() => {
    if (!profileMenuOpen) return
    const handleClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [profileMenuOpen])

  useEffect(() => {
    if (!user) {
      setProfileMenuOpen(false)
    }
  }, [user])

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logoutUser()
      setProfileMenuOpen(false)
      router.push("/login")
    } catch (error) {
      console.error("Failed to logout", error)
    } finally {
      setLoggingOut(false)
    }
  }

  // ✅ Navbar background logic
  const isHome = pathname === "/"
  const navbarBg =
    isHome && !scrolled
      ? "bg-transparent backdrop-blur-0"
      : "bg-brand/95 backdrop-blur-md shadow-lg"

  return (
        <>
      <Dialog open={searchOpen} onClose={closeSearch} className="relative z-[60]">
        <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity data-[closed]:opacity-0" />
        <div className="fixed inset-0 overflow-y-auto px-4 py-10 sm:px-6 sm:py-16">
          <div className="mx-auto flex min-h-full max-w-5xl items-start justify-center">
            <DialogPanel className="relative w-full overflow-hidden rounded-3xl bg-white/95 shadow-2xl ring-1 ring-black/10 backdrop-blur">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 right-10 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
                <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl" />
              </div>
              <div className="relative flex flex-col gap-8 p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand/60">
                    Search the atelier
                  </p>
                  {hasQuery && (
                    <span className="text-xs text-brand/60">
                      {searchLoading
                        ? "Searching…"
                        : `${results.length.toString().padStart(2, "0")} curated results`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 rounded-full border border-brand/15 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                  <MagnifyingGlassIcon className="h-5 w-5 text-brand" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search jewels, categories, stories…"
                    className="flex-1 bg-transparent text-sm text-brand placeholder:text-brand/40 outline-none"
                  />
                  {sanitizedQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("")
                        setResults([])
                      }}
                      className="hidden text-xs font-medium uppercase tracking-[0.2em] text-brand/60 transition hover:text-brand lg:inline"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-inner transition hover:bg-brand/90"
                    aria-label="Close search"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.3em] text-brand/60">
                        Live results
                      </p>
                    </div>

                    {hasQuery ? (
                      searchLoading && results.length === 0 ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, idx) => (
                            <div
                              key={idx}
                              className="flex gap-4 rounded-2xl border border-brand/10 bg-white/70 p-4 shadow-sm animate-pulse"
                            >
                              <div className="h-16 w-16 rounded-2xl bg-brand/10" />
                              <div className="flex-1 space-y-3">
                                <div className="h-3 w-2/3 rounded-full bg-brand/15" />
                                <div className="h-3 w-1/2 rounded-full bg-brand/10" />
                                <div className="h-3 w-1/3 rounded-full bg-brand/5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : showEmptyState ? (
                        <div className="rounded-3xl border border-dashed border-brand/20 bg-white/70 p-8 text-center text-sm text-brand/70">
                          We couldn’t find a perfect match. Try refining the muse or explore the curated stories alongside.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-1">
                          {results.map((product) => {
                            const priceLabel = formatPrice(product)
                            const subtitle = getProductSubtitle(product)
                            return (
                              <Link
                                key={product.id || product.handle || product.slug}
                                href={resolveProductHref(product)}
                                onClick={closeSearch}
                                className="group flex gap-4 rounded-3xl border border-brand/10 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
                              >
                                <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-brand/5">
                                  <Image
                                    src={getProductImage(product)}
                                    alt={product.title || product.name || "Product"}
                                    fill
                                    className="object-cover transition duration-500 group-hover:scale-105"
                                    sizes="80px"
                                    unoptimized
                                  />
                                </div>
                                <div className="flex flex-1 flex-col gap-1">
                                  <p className="text-sm font-semibold text-brand leading-tight">
                                    {highlightMatch(product.title || product.name || "Untitled masterpiece")}
                                  </p>
                                  {subtitle && (
                                    <p className="text-xs text-gray-600 leading-snug">
                                      {highlightMatch(subtitle)}
                                    </p>
                                  )}
                                  <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                                    <span className="uppercase tracking-[0.2em] text-brand/60">
                                      {(product.categoryName || product.category || product.categorySlug || "Signature")
                                        .toString()
                                        .replace(/-/g, " ")}
                                    </span>
                                    {priceLabel && (
                                      <span className="text-sm font-semibold text-brand">{priceLabel}</span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      )
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {curatedSearches.map((item) => (
                          <button
                            key={item.title}
                            type="button"
                            onClick={() => {
                              setQuery(item.query)
                              searchInputRef.current?.focus()
                            }}
                            className={`group relative overflow-hidden rounded-3xl border border-brand/10 bg-gradient-to-br ${item.accent} p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
                          >
                            <span className="text-[10px] font-semibold uppercase tracking-[0.45em] text-brand/60">
                              {item.badge}
                            </span>
                            <span className="mt-3 block text-lg font-semibold text-brand">
                              {item.title}
                            </span>
                            <span className="mt-1 block text-xs text-brand/70">{item.subtitle}</span>
                            <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-brand/80">
                              Discover
                              <ArrowRightIcon className="h-4 w-4" />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-3xl border border-brand/10 bg-white/85 p-6 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.35em] text-brand/60">Trending now</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {trendingSearches.map((label) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => {
                              setQuery(label)
                              searchInputRef.current?.focus()
                            }}
                            className="rounded-full border border-brand/20 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-brand transition hover:bg-brand/10"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-brand/15 bg-brand text-white p-6 shadow-xl">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/70">Curated stories</p>
                      <div className="mt-4 space-y-3">
                        {editorialHighlights.map((story) => (
                          <Link
                            key={story.title}
                            href={story.href}
                            onClick={closeSearch}
                            className="group block rounded-2xl bg-white/10 p-4 transition hover:bg-white/15"
                          >
                            <p className="text-sm font-semibold">{story.title}</p>
                            <p className="mt-1 text-xs text-white/80">{story.copy}</p>
                            <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-amber-100 group-hover:gap-3">
                              Explore
                              <ArrowRightIcon className="h-4 w-4" />
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Mobile sidebar / drawer */}
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50 lg:hidden">
        <DialogBackdrop className="fixed inset-0 bg-black/40 transition-opacity" />
        <div className="fixed inset-0 flex">
          <DialogPanel className="relative w-72 max-w-full overflow-y-auto bg-white/95 p-4 shadow-2xl ring-1 ring-black/5 backdrop-blur">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <Image src="/logoLan.png" alt="Megora" width={100} height={60} />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-6 space-y-2">
              <Link href="/" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">Home</Link>
              <Link href="/collections" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">Shop</Link>
              <Link href="/categories" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">Categories</Link>
              <Link href="/wishlist" onClick={() => setOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">
                <span>Wishlist</span>
                {wishlist.length > 0 && <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{wishlist.length}</span>}
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">
                <span>Cart</span>
                {cart.length > 0 && <span className="ml-2 inline-flex items-center justify-center rounded-full bg-yellow-500 px-2 py-0.5 text-xs text-white">{cart.length}</span>}
              </Link>

              <div className="pt-2">
                {user ? (
                  <Link href="/profile" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">{firstName || user.displayName || 'Profile'}</Link>
                ) : (
                  <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">Login / Signup</Link>
                )}
              </div>
            </nav>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Quick picks</p>
              <div className="mt-3 grid gap-2">
                {curatedSearches.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => { setQuery(item.query); setOpen(false); openSearch(); }}
                    className="text-left rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-gray-400">{item.badge}</span>
                    </div>
                    <div className="text-xs text-gray-500">{item.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>
          </DialogPanel>

          {/* click on overlay closes drawer */}
          <div className="flex-1" onClick={() => setOpen(false)} />
        </div>
      </Dialog>

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

            {/* Search trigger */}
            <button
              type="button"
              onClick={openSearch}
              className="hidden lg:flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Search</span>
            </button>

            <button
              type="button"
              className="lg:hidden text-white"
              onClick={openSearch}
              aria-label="Search"
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

            {/* Profile / Login */}
{/* Profile / Login */}
{authLoading ? (
  <div className="h-8 w-8 rounded-full border border-white/50 animate-pulse" />
) : user ? (
  // Logged in → show avatar + dropdown
  <div className="relative" ref={profileMenuRef}>
    <button
      type="button"
      onClick={() => setProfileMenuOpen((prev) => !prev)}
      className="transition"
      title={firstName || user?.displayName || "My Account"}
      aria-haspopup="menu"
      aria-expanded={profileMenuOpen}
    >
      {/* Letter avatar (first initial) */}
      <div
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-medium text-white"
      >
        {firstInitial}
      </div>
    </button>

    {profileMenuOpen && (
      <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white/95 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">
            {firstName || user.displayName || "Welcome back"}
          </p>
          {user.email && (
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          )}
        </div>
        <div className="py-2">
          <Link
            href="/profile"
            onClick={() => setProfileMenuOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            View Profile
          </Link>
          <Link
            href="/orders"
            onClick={() => setProfileMenuOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            My Orders
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-between px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Logout
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    )}
  </div>
) : (
  // Not logged in → show login icon only
  <Link
    href="/login"
    className="transition-colors duration-300"
    title="Login / Signup"
  >
    <UserCircleIcon className="h-7 w-7 text-white hover:text-gray-200" />
  </Link>
)}

          </div>
        </div>
      </nav>
    </header>
    </>
  )
}