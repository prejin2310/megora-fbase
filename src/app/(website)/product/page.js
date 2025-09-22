"use client"

import { useEffect, useState } from "react"
import {
  getFilteredProducts,
  getCategories,
} from "@/lib/db"
import ProductCard from "@/components/product/ProductCard"
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline"

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

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const cats = await getCategories()
        setCategories(cats)
        const prods = await getFilteredProducts({
          categoryId: selectedCategory,
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

  const showingFrom = startIdx + 1
  const showingTo = Math.min(startIdx + perPage, products.length)

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FDFBED] via-white to-[#f8f6f2] py-16">
      {/* Navbar Spacer */}
      <div className="h-24" />

      <section className="mx-auto max-w-7xl px-4 text-brand-dark">
        <div className="mb-10 text-center">
          <h1 className="font-playfair text-3xl md:text-4xl">Our Collection</h1>
          <p className="mt-3 text-sm text-brand-dark/70">
            Discover timeless jewelry curated for elegance and everyday luxury.
          </p>
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
                max="3000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full accent-brand"
              />
              <div className="mt-2 text-xs">Up to ₹{priceRange[1]}</div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedCategory("all")}
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
                      onClick={() => setSelectedCategory(c.id)}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                        selectedCategory === c.id
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
              <div className="mt-10 rounded-2xl border border-brand/20 bg-white p-10 text-center text-brand-dark/70">
                No products found for your filters.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Drawer (mobile only) */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden">
          <div className="absolute right-0 top-0 h-full w-80 max-w-[80%] bg-white p-6 shadow-xl">
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
              <div className="mt-2 text-xs text-brand-dark">
                Up to ₹{priceRange[1]}
              </div>
            </div>

            {/* Categories */}
            <div>
              <p className="mb-2 text-sm font-medium text-brand-dark">Categories</p>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedCategory("all")}
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
                      onClick={() => setSelectedCategory(c.id)}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                        selectedCategory === c.id
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
          </div>
        </div>
      )}
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
