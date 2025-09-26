"use client"

import { useEffect, useState } from "react"
import {
  getFilteredProducts,
  getCategories,
} from "@/lib/db"
import ProductCard from "@/components/product/ProductCard"
import { FunnelIcon, XMarkIcon, ShoppingBagIcon, SparklesIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import toast from "react-hot-toast"

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

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 12

  // Filters
  const [sortOption, setSortOption] = useState("default")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showFilters, setShowFilters] = useState(false) // mobile drawer
  const [query, setQuery] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const cats = await getCategories()
        setCategories(cats)
        const prods = await getFilteredProducts({
          categorySlug: selectedCategory,
          priceRange,
          sort: sortOption,
        })
        setProducts(prods)
      } catch (err) {
        console.error("products-page", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sortOption, priceRange, selectedCategory])

  // Pagination
  const totalPages = Math.ceil(products.length / perPage)
  const startIdx = (currentPage - 1) * perPage
  const paginated = products.slice(startIdx, startIdx + perPage)
  const showingFrom = products.length ? startIdx + 1 : 0
  const showingTo = Math.min(startIdx + perPage, products.length)

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FDFBED] via-white to-[#f8f6f2] py-16">
      {/* Navbar Spacer */}
      <div className="h-24" />

      <section className="mx-auto max-w-7xl px-4 text-brand-dark">
        {/* Optional page intro */}
        <div className="mb-6 text-center">
          <h2 className="font-playfair text-2xl md:text-3xl">Shop</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:block md:col-span-1 space-y-8">
            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Price Range</h3>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full accent-brand"
              />
              <div className="mt-2 text-xs">Up to ₹{priceRange[1]}</div>
            </div>

            {/* Categories (desktop) */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => { setSelectedCategory("all"); setCurrentPage(1); toast.success("Showing all categories") }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                      selectedCategory === "all"
                        ? "bg-brand text-white"
                        : "bg-gray-100 text-brand-dark hover:bg-brand/10"
                    }`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => { setSelectedCategory(c.slug || c.id); setCurrentPage(1); toast.success(`Showing ${c.name}`) }}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                        selectedCategory === (c.slug || c.id)
                          ? "bg-brand text-white"
                          : "bg-gray-100 text-brand-dark hover:bg-brand/10"
                      }`}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Products Section */}
          <div className="md:col-span-3">
            {/* Controls */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-brand-dark/70">
                Showing {showingFrom}–{showingTo} of {products.length} results
              </p>

              <div className="flex items-center gap-4">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="rounded-lg border border-brand/20 bg-white px-4 py-2 text-sm text-brand-dark shadow-sm focus:outline-none"
                >
                  <option value="default">Default Sort</option>
                  <option value="newest">Newest First</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>

                {/* Filter button (mobile only) */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-brand/20 bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm md:hidden"
                >
                  <FunnelIcon className="h-5 w-5" />
                  Filters
                </button>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: perPage }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : paginated.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {paginated.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          currentPage === i + 1
                            ? "bg-brand text-white"
                            : "bg-white border border-brand/30 text-brand-dark hover:bg-brand/10"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-2xl border border-brand/20 bg-white p-10 text-center text-brand-dark/70">
                <div className="relative flex items-center justify-center">
                  <div className="absolute -inset-3 animate-blob rounded-full bg-amber-100/40 blur-3xl" />
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-white to-rose-100 shadow-lg">
                    <ShoppingBagIcon className="h-10 w-10 text-amber-700" />
                  </div>
                </div>

                <h3 className="mt-2 text-xl font-semibold text-brand-dark">No matching pieces found</h3>
                <p className="max-w-xl text-sm text-brand-dark/70">
                  We couldn&apos;t find products that match your filters. Try widening the price
                  range, clearing category selections, or explore curated picks below.
                </p>

                <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
                  <button
                    onClick={() => {
                      setSelectedCategory("all")
                      setPriceRange([0, 10000])
                      setSortOption("default")
                      setCurrentPage(1)
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand/90"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    Clear filters
                  </button>

                  <Link
                    href="/collections"
                    onClick={() => setCurrentPage(1)}
                    className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow hover:bg-brand/5"
                  >
                    Browse collections
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="mt-6 text-xs text-brand-dark/50">Or try these curated picks</div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {curatedSearches.slice(0, 4).map((c) => (
                    <button
                      key={c.title}
                      onClick={() => {
                        setQuery(c.query)
                        setShowFilters(false)
                        setCurrentPage(1)
                      }}
                      className="rounded-full border border-brand/10 bg-white px-3 py-1 text-xs font-medium text-brand-dark hover:bg-brand/5"
                    >
                      {c.badge}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Drawer (mobile only) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* overlay */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
            />

            {/* drawer */}
            <motion.aside
              className="absolute right-0 top-0 h-full w-80 max-w-[80%] bg-white p-6 shadow-xl"
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "tween", duration: 0.28 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-brand-dark">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-full p-1 text-brand-dark hover:bg-brand/10"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <p className="mb-2 text-sm font-medium text-brand-dark">Price Range</p>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-brand"
                />
                <div className="mt-2 text-xs text-brand-dark">Up to ₹{priceRange[1]}</div>
              </div>

              {/* Categories */}
              <div>
                <p className="mb-2 text-sm font-medium text-brand-dark">Categories</p>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => {
                        setSelectedCategory("all")
                        setShowFilters(false)
                        setCurrentPage(1)
                        toast.success("Showing all categories")
                      }}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                        selectedCategory === "all"
                          ? "bg-brand text-white"
                          : "bg-gray-100 text-brand-dark hover:bg-brand/10"
                      }`}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(c.slug || c.id)
                          setShowFilters(false)
                          setCurrentPage(1)
                          toast.success(`Showing ${c.name}`)
                        }}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                          selectedCategory === (c.slug || c.id)
                            ? "bg-brand text-white"
                            : "bg-gray-100 text-brand-dark hover:bg-brand/10"
                        }`}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-brand/10 bg-white p-4 shadow-sm">
      <div
        className="animate-pulse rounded-xl bg-brand/10"
        style={{ aspectRatio: "4 / 5" }}
      />
      <div className="mt-4 space-y-3">
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-brand/20" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-brand/20" />
      </div>
      <div className="mt-auto pt-4">
        <div className="h-10 w-full animate-pulse rounded-full bg-brand/15" />
      </div>
    </div>
  )
}
