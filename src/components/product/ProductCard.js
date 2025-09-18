"use client"

import Image from "next/image"
import { HeartIcon, ShoppingBagIcon, EyeIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"

export default function ProductCard({ product }) {
  const thumbnail =
    product.media?.find((m) => m.thumbnail)?.url || "/demo/product1.jpg"

  // Stock
  const totalStock =
    product.variants
      ?.flatMap((v) => v.options)
      ?.reduce((sum, o) => sum + (Number(o.stock) || 0), 0) ||
    product.stock ||
    0

  // Price
  const price =
    product.price || product.variants?.[0]?.options?.[0]?.price || 0
  const dummyPrice = Math.round(price * 1.2)

  const isOut = totalStock === 0
  const isLimited = totalStock > 0 && totalStock < 5

  return (
    <div className="group relative bg-white shadow-md overflow-hidden">
      {/* Limited Stock Badge */}
{/* Limited Stock Badge */}
{isLimited && (
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
            isOut && "opacity-60"
          )}
        />

        {/* Hover Icons (only if in stock) */}
        {!isOut && (
          <div className="absolute inset-0 flex flex-col items-end justify-start gap-3 p-3 opacity-0 group-hover:opacity-100 transition z-10">
            <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
              <HeartIcon className="w-5 h-5 text-gray-700" />
            </button>
            <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
              <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
            </button>
            <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
              <EyeIcon className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <span className="bg-brand text-white text-sm md:text-base font-semibold px-4 py-2">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-brand text-lg line-clamp-1">
          {product.title}
        </h3>

        {/* Price */}
        <div className="mt-1 flex items-center gap-2">
          <span className="line-through text-gray-400 text-sm">₹{dummyPrice}</span>
          <span className="text-brand font-semibold">₹{price}</span>
        </div>

        {/* Colors */}
        {product.variants?.some((v) => v.title.toLowerCase() === "color") && (
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
  )
}

// Helper
function getColorHex(name) {
  switch (name.toLowerCase()) {
    case "emerald":
    case "green":
      return "#00674F"
    case "ruby":
      return "#850014"
    case "red":
      return "#8B0000"
    case "violet":
      return "#310b56ff"
    case "gold":
      return "#FFD700"
    case "silver":
      return "#C0C0C0"
    default:
      return "#999"
  }
}
