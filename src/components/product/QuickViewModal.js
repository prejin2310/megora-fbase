"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"

export default function QuickViewModal({ open, onClose, product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null)
  const [selectedImage, setSelectedImage] = useState(
    product.variants?.[0]?.images?.[0]?.url ||
      product.media?.[0]?.url ||
      "/demo/product1.jpg"
  )

  if (!product) return null

  const handleSelectOption = (title, name) => {
    const variant = product.variants?.find((v) =>
      v.options?.some(
        (o) => o.title.toLowerCase() === title.toLowerCase() && o.name === name
      )
    )
    if (variant) {
      setSelectedVariant(variant)
      setSelectedImage(variant.images?.[0]?.url || selectedImage)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-5xl w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-black"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images Gallery */}
            <div className="flex gap-3">
              {/* Thumbnails */}
              <div className="flex flex-col gap-2 w-20 overflow-y-auto">
                {(selectedVariant?.images?.length
                  ? selectedVariant.images
                  : product.media || []
                ).map((im, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(im.url)}
                    className={clsx(
                      "relative w-16 h-16 border rounded-md cursor-pointer overflow-hidden",
                      selectedImage === im.url
                        ? "border-brand ring-2 ring-brand"
                        : "border-gray-300"
                    )}
                  >
                    <Image
                      src={im.url}
                      alt="thumb"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Main Image with Native Hover Zoom */}
              <div
                className="flex-1 relative rounded-lg overflow-hidden group"
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector("img")
                  img.style.transform = "scale(1)"
                  img.style.transformOrigin = "center"
                }}
                onMouseMove={(e) => {
                  const img = e.currentTarget.querySelector("img")
                  const { left, top, width, height } =
                    e.currentTarget.getBoundingClientRect()
                  const x = ((e.pageX - left) / width) * 100
                  const y = ((e.pageY - top) / height) * 100
                  img.style.transformOrigin = `${x}% ${y}%`
                  img.style.transform = "scale(2)" // zoom level
                }}
              >
                <Image
                  src={selectedImage}
                  alt={product.title}
                  width={500}
                  height={500}
                  className="rounded-lg object-cover w-full h-[450px] transition-transform duration-200 ease-in-out"
                />
              </div>
            </div>

            {/* Info */}
            <div>
              <Dialog.Title className="text-lg font-semibold text-brand">
                {product.title}
              </Dialog.Title>
              <p className="text-sm text-gray-600 mt-1">{product.subtitle}</p>
              <p className="text-sm text-gray-500 mt-2">{product.description}</p>

              {/* Price */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xl font-bold text-brand">
                  ₹{selectedVariant?.priceINR || 0}
                </span>
                {selectedVariant?.fakePriceINR > selectedVariant?.priceINR && (
                  <span className="line-through text-gray-400">
                    ₹{selectedVariant.fakePriceINR}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="mt-4 space-y-3">
                {getOptionTitles(product.variants).map((title) => {
                  const options = [
                    ...new Set(
                      product.variants
                        .map(
                          (v) =>
                            v.options.find(
                              (o) =>
                                o.title.toLowerCase() === title.toLowerCase()
                            )?.name
                        )
                        .filter(Boolean)
                    ),
                  ]
                  return (
                    <div key={title}>
                      <span className="text-sm font-medium">{title}:</span>
                      <div className="flex gap-2 mt-1">
                        {options.map((name, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectOption(title, name)}
                            className={clsx(
                              "px-3 py-1 text-sm rounded border",
                              selectedVariant?.options?.some(
                                (o) =>
                                  o.title.toLowerCase() ===
                                    title.toLowerCase() && o.name === name
                              )
                                ? "bg-brand text-white border-brand"
                                : "bg-white hover:bg-gray-100"
                            )}
                            style={
                              title.toLowerCase() === "color"
                                ? {
                                    backgroundColor: getColorHex(name),
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    padding: 0,
                                  }
                                : {}
                            }
                          >
                            {title.toLowerCase() !== "color" && name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Stock */}
              <div className="mt-4">
                {selectedVariant?.stock > 0 ? (
                  <span className="text-sm text-green-600">
                    In Stock ({selectedVariant.stock} available)
                  </span>
                ) : (
                  <span className="text-sm text-red-600">Out of Stock</span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <a
                  href="/cart"
                  className={clsx(
                    "px-4 py-2 rounded font-medium text-white text-center",
                    selectedVariant?.stock > 0
                      ? "bg-brand hover:bg-brand-dark"
                      : "bg-gray-400 cursor-not-allowed"
                  )}
                >
                  Add to Cart
                </a>
                <a
                  href="/checkout"
                  className={clsx(
                    "px-4 py-2 rounded font-medium text-white text-center",
                    selectedVariant?.stock > 0
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-gray-400 cursor-not-allowed"
                  )}
                >
                  Buy Now
                </a>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

// Utility: extract unique option titles
function getOptionTitles(variants) {
  const titles = []
  variants?.forEach((v) =>
    v.options?.forEach((o) => {
      if (o?.title && !titles.includes(o.title)) titles.push(o.title)
    })
  )
  return titles
}

// Helper: map color names to hex
function getColorHex(name) {
  switch (name?.toLowerCase()) {
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
