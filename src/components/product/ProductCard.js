"use client"

import { useState } from "react"
import Image from "next/image"
import clsx from "clsx"
import { HeartIcon, ShoppingBagIcon, EyeIcon } from "@heroicons/react/24/outline"
import QuickViewModal from "@/components/product/QuickViewModal"

export default function ProductCard({ product }) {
  const [quickView, setQuickView] = useState(false)

  // Pick thumbnail
  const thumbnail =
    product.media?.find((m) => m.thumbnail)?.url || "/demo/product1.jpg"

  // Stock calculation
  const totalStock =
    product.variants?.flatMap((v) => v.options)?.reduce(
      (sum, o) => sum + (Number(o.stock) || 0),
      0
    ) || product.stock || 0

  // Prices
  const price =
    product.price || product.variants?.[0]?.options?.[0]?.price || 0
  const dummyPrice = Math.round(price * 1.2)

  return (
    <>
      <div className="group relative bg-white shadow-md overflow-hidden">
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
          <span className="absolute top-3 left-3 bg-brand-light text-brand text-xs px-3 py-1 z-10 font-medium">
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

          {/* Hover Icons */}
          <div className="absolute inset-0 flex flex-col items-end justify-start gap-3 p-3 opacity-0 group-hover:opacity-100 transition z-20">
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

        {/* Info */}
        <div className="p-4">
          <h3 className="font-medium text-brand text-lg line-clamp-1">
            {product.title}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-brand font-semibold">₹{price}</span>
            <span className="line-through text-gray-400 text-sm">
              ₹{dummyPrice}
            </span>
          </div>

          {/* Colors */}
          {product.variants?.some(
            (v) => v.title.toLowerCase() === "color"
          ) && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-600">Colors:</span>
              <div className="flex gap-2">
                {product.variants
                  .find((v) => v.title.toLowerCase() === "color")
                  ?.options.map((option, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border cursor-pointer"
                      style={{ backgroundColor: getColorHex(option.name) }}
                      title={option.name}
                    />
                  ))}
              </div>
            </div>
          )}
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

// Helper for color mapping
function getColorHex(name) {
  switch (name.toLowerCase()) {
    case "emerald":
      return "#00674F"
    case "ruby":
      return "#850014"
    case "violet":
      return "#310b56"
    case "gold":
      return "#FFD700"
    case "silver":
      return "#C0C0C0"
    default:
      return "#999"
  }
}
