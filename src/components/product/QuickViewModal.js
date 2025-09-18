"use client"

import { Dialog, DialogPanel } from "@headlessui/react"
import { XMarkIcon, ShoppingBagIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"

export default function QuickViewModal({ open, onClose, product }) {
  if (!product) return null

  const thumbnail =
    product.media?.find((m) => m.thumbnail)?.url || "/demo/product1.jpg"

  const totalStock =
    product.variants?.flatMap((v) => v.options)?.reduce(
      (sum, o) => sum + (Number(o.stock) || 0),
      0
    ) || product.stock || 0

  const price = product.price || product.variants?.[0]?.options?.[0]?.price || 0
  const dummyPrice = Math.round(price * 1.2)

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full overflow-hidden">
          {/* Close button */}
          <button
  onClick={onClose}
  className="absolute top-3 right-3 p-2 rounded-full bg-black/40 md:bg-white md:hover:bg-gray-100"
>
  <XMarkIcon className="h-6 w-6 text-white md:text-gray-700" />
</button>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="relative h-80 md:h-full">
              <Image
                src={thumbnail}
                alt={product.title}
                fill
                className="object-cover rounded-l-lg"
              />
              {totalStock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-playfair font-bold text-brand">
                  {product.title}
                </h2>

                {/* Price */}
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-lg font-semibold text-brand">
                    ₹{price}
                  </span>
                  <span className="line-through text-gray-400 text-sm">
                    ₹{dummyPrice}
                  </span>
                </div>

                {/* Short description */}
                {product.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-4">
                    {product.description}
                  </p>
                )}

                {/* Colors */}
                {product.variants?.some(
                  (v) => v.title.toLowerCase() === "color"
                ) && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-700">
                      Colors:
                    </span>
                    <div className="flex gap-2 mt-2">
                      {product.variants
                        .find((v) => v.title.toLowerCase() === "color")
                        ?.options.map((option, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: getColorHex(option.name) }}
                            title={option.name}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-4">
                {totalStock > 0 ? (
                  <button className="flex items-center gap-2 bg-brand text-white px-5 py-2 rounded hover:bg-brand-dark">
                    <ShoppingBagIcon className="h-5 w-5" />
                    Add to Cart
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-2 bg-gray-300 text-gray-600 px-5 py-2 rounded cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}

                <Link
                  href={`/products/${product.slug}`}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  View Full Details →
                </Link>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

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
