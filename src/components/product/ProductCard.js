"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import clsx from "clsx"
import { HeartIcon, ShoppingBagIcon, EyeIcon } from "@heroicons/react/24/outline"
import QuickViewModal from "@/components/product/QuickViewModal"
import { getColorCode } from "@/lib/colors"

export default function ProductCard({ product }) {
  const [quickView, setQuickView] = useState(false)

  const thumbnail =
    product.media?.find((m) => m.thumbnail)?.url || "/demo/product1.jpg"

  const totalStock =
    product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) ||
    product.stock ||
    0

  const prices = product.variants?.map((v) => v.priceINR) || []
  const price = prices.length > 0 ? Math.min(...prices) : 0
  const fakePrices = product.variants?.map((v) => v.fakePriceINR) || []
  const fakePrice =
    fakePrices.length > 0 ? Math.max(...fakePrices) : Math.round(price * 1.2)

  const colorOptions =
    product.variants
      ?.map((v) =>
        v.options.find((o) => o.title?.toLowerCase() === "color")?.name
      )
      .filter(Boolean) || []

  return (
    <>
      <div className="group relative bg-white overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-lg">
        <Link href={`/product/${product.handle}`}>
          {/* Out of Stock Banner */}
          {totalStock === 0 && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="bg-white/80 w-full py-3 text-center">
                <span className="text-brand font-bold uppercase tracking-wide">
                  OUT OF STOCK
                </span>
              </div>
            </div>
          )}

          {/* Limited Stock Badge */}
          {totalStock > 0 && totalStock < 5 && (
            <span className="absolute top-3 left-3 bg-brand-light text-brand text-xs px-3 py-1 z-10 font-medium">
              Limited Stock
            </span>
          )}

          {/* Image */}
          <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden">
            <Image
              src={thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
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
                      className="w-5 h-5 border cursor-pointer"
                      style={{ backgroundColor: getColorCode(name) }}
                      title={name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Hover Icons */}
        <div className="absolute inset-0 flex flex-col items-end justify-start gap-3 p-3 opacity-0 group-hover:opacity-100 transition z-20 pointer-events-none">
          <div className="flex flex-col gap-3 pointer-events-auto">
            <button className="bg-white p-2 shadow hover:bg-gray-100">
              <HeartIcon className="w-5 h-5 text-gray-700" />
            </button>
            <button className="bg-white p-2 shadow hover:bg-gray-100">
              <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => setQuickView(true)}
              className="bg-white p-2 shadow hover:bg-gray-100"
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
