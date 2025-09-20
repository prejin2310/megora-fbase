"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import clsx from "clsx"
import { HeartIcon, ShoppingBagIcon, EyeIcon } from "@heroicons/react/24/outline"
import QuickViewModal from "@/components/product/QuickViewModal"

export default function ProductCard({ product }) {
  const [quickView, setQuickView] = useState(false)

  // ✅ Pick thumbnail
  const thumbnail =
    product.media?.find((m) => m.thumbnail)?.url || "/demo/product1.jpg"

  // ✅ Stock calculation from new schema
  const totalStock =
    product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) ||
    product.stock ||
    0

  // ✅ Price: take the lowest variant price (for display)
  const prices = product.variants?.map((v) => v.priceINR) || []
  const price = prices.length > 0 ? Math.min(...prices) : 0
  const fakePrices = product.variants?.map((v) => v.fakePriceINR) || []
  const fakePrice =
    fakePrices.length > 0 ? Math.max(...fakePrices) : Math.round(price * 1.2)

  // ✅ Extract colors from variant options
  const colorOptions =
    product.variants
      ?.map((v) =>
        v.options.find((o) => o.title?.toLowerCase() === "color")?.name
      )
      .filter(Boolean) || []

  return (
    <>
      <div className="group relative bg-white shadow-md overflow-hidden rounded-xl">
        {/* Link wrapper for navigation */}
       <Link href={`/product/${product.handle}`}>
          {/* Out of Stock Overlay */}
          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="text-white text-lg font-semibold">
                Out of Stock
              </span>
            </div>
          )}

          {/* Limited Stock Badge */}
          {totalStock > 0 && totalStock < 5 && (
            <span className="absolute top-3 left-3 bg-brand-light text-brand text-xs px-3 py-1 z-10 font-medium rounded-full">
              Limited Stock
            </span>
          )}

          {/* Image */}
          <div className="relative w-full h-80 overflow-hidden">
            <Image
              src={thumbnail}
              alt={product.title}
              fill
              className={clsx(
                "object-cover transition-transform duration-500 group-hover:scale-105",
                totalStock === 0 && "opacity-50"
              )}
            />
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-medium text-brand text-lg line-clamp-1">
              {product.title}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              {fakePrice > price && (
                <span className="line-through text-gray-400 text-sm">
                  ₹{fakePrice}
                </span>
              )}
              <span className="text-brand font-semibold">₹{price}</span>
            </div>

            {/* Colors */}
            {colorOptions.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-600">Colors:</span>
                <div className="flex gap-2">
                  {colorOptions.map((name, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border cursor-pointer"
                      style={{ backgroundColor: getColorHex(name) }}
                      title={name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Hover Icons (kept outside Link so they don’t trigger navigation) */}
        <div className="absolute inset-0 flex flex-col items-end justify-start gap-3 p-3 opacity-0 group-hover:opacity-100 transition z-20 pointer-events-none">
          <div className="flex flex-col gap-3 pointer-events-auto">
            <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
              <HeartIcon className="w-5 h-5 text-gray-700" />
            </button>
            <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
              <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => setQuickView(true)}
              className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
            >
              <EyeIcon className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        open={quickView}
        onClose={() => setQuickView(false)}
        product={product}
      />
    </>
  )
}

// ✅ Helper for color mapping
function getColorHex(name) {
  switch (name.toLowerCase()) {
    case "emerald":
      return "#025340ff"
    case "ruby":
      return "#b41c33ff"
    case "violet":
      return "#310b56"
    case "gold":
      return "#ccaf08ff"
    case "silver":
      return "#C0C0C0"
    default:
      return "#d6d5d5ff"
  }
}
