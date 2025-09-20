"use client"

import { useState } from "react"
import { StarIcon } from "@heroicons/react/20/solid"
import {
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathRoundedSquareIcon,
  TagIcon,
  CubeIcon,
  HeartIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline"
import toast from "react-hot-toast"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"

function Stars({ value = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon
          key={i}
          className={`h-4 w-4 ${
            i <= value ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export default function ProductInfo({
  product,
  variant,
  setVariant,
  categoryName,
  reviews = [],
}) {
  const { addItem, buyNow } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()

  const [qty, setQty] = useState(1)
  const [pin, setPin] = useState("")
  const [deliveryMsg, setDeliveryMsg] = useState("")

  if (!product) return null

  const avg =
    reviews?.length > 0
      ? (
          reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0) /
          reviews.length
        ).toFixed(1)
      : 0

  const handleAddToCart = () => {
    if (!variant) {
      toast.error("Please select a variant")
      return
    }
    addItem({
      id: product.id,
      title: product.title,
      slug: product.handle,
      price: variant.price,
      compareAtPrice: variant.fakePrice,
      qty,
      image: variant.images?.[0] || product.defaultImages?.[0] || "/placeholder.png",
      color: variant.option?.name,
      size: variant.attributes?.size,
      sku: product.sku,
    })
    toast.success("Added to cart")
  }

  const handleBuyNow = () => {
    if (!variant) {
      toast.error("Please select a variant")
      return
    }
    buyNow({
      id: product.id,
      title: product.title,
      slug: product.handle,
      price: variant.price,
      compareAtPrice: variant.fakePrice,
      qty,
      image: variant.images?.[0] || product.defaultImages?.[0] || "/placeholder.png",
      color: variant.option?.name,
      size: variant.attributes?.size,
      sku: product.sku,
    })
  }

  const checkPin = (e) => {
    e.preventDefault()
    if (!pin || pin.length < 6) {
      setDeliveryMsg("Please enter a valid 6-digit pincode.")
      return
    }
    setDeliveryMsg("Estimated delivery: 3–7 days.")
  }

  const variants = product.variants || []

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
        {product.title}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Stars value={Math.round(avg)} />
        <span>{avg} out of 5</span>
        <span>·</span>
        <span>{reviews?.length || 0} reviews</span>
      </div>

      {/* Price + Stock */}
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold text-gray-900">
          ₹{variant?.price || variants[0]?.price}
        </span>
        {variant?.fakePrice && (
          <span className="text-lg text-gray-500 line-through">
            ₹{variant.fakePrice}
          </span>
        )}
        {variant?.stock > 0 ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            In stock · {variant.stock} left
          </span>
        ) : (
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
            Out of stock
          </span>
        )}
      </div>

      {/* Variants Section */}
      {variants.length > 0 && (
        <div className="space-y-4">
          {/* Colors */}
          {variants.filter((v) => v.option?.title?.toLowerCase() === "color")
            .length > 1 ? (
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Color</div>
              <div className="flex gap-2 flex-wrap">
                {variants
                  .filter((v) => v.option?.title?.toLowerCase() === "color")
                  .map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariant(v)}
                      className={`px-3 py-1 rounded-full border text-sm ${
                        variant?.id === v.id
                          ? "border-brand bg-brand text-white"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {v.option?.name}
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            variants.some((v) => v.option?.title?.toLowerCase() === "color") && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Color:</span>{" "}
                {
                  variants.find(
                    (v) => v.option?.title?.toLowerCase() === "color"
                  )?.option?.name
                }
              </div>
            )
          )}

          {/* Sizes */}
          {variants.filter((v) => v.attributes?.size).length > 1 ? (
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Size</div>
              <div className="flex gap-2 flex-wrap">
                {variants
                  .filter((v) => v.attributes?.size)
                  .map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariant(v)}
                      className={`px-3 py-1 rounded-full border text-sm ${
                        variant?.id === v.id
                          ? "border-brand bg-brand text-white"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {v.attributes.size}
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            variants.some((v) => v.attributes?.size) && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Size:</span>{" "}
                {variants.find((v) => v.attributes?.size)?.attributes.size}
              </div>
            )
          )}
        </div>
      )}


      {/* Qty + Wishlist */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-gray-300">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">
            –
          </button>
          <span className="min-w-10 text-center">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2">
            +
          </button>
        </div>
        <button
          onClick={() => toggleWishlist(product)}
          className={`rounded-full border px-4 py-2 text-sm ${
            isWishlisted?.(product.id)
              ? "border-amber-500 text-amber-700"
              : "border-gray-300 hover:border-gray-500"
          }`}
        >
          {isWishlisted?.(product.id) ? "Wishlisted" : "Add to Wishlist"}
        </button>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={!variant?.stock}
          className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-white shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBagIcon className="h-5 w-5" />
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!variant?.stock}
          className="rounded-lg border border-brand px-6 py-3 text-brand hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>

      {/* Meta: Category, SKU, Trust */}
      <div className="space-y-2 pt-3 text-sm text-gray-700">
        {categoryName && (
          <div className="flex items-center gap-2">
            <CubeIcon className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Category:</span> {categoryName}
          </div>
        )}
        {product.sku && (
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-gray-500" />
            <span className="font-medium">SKU:</span> {product.sku}
          </div>
        )}
      </div>

            {/* Delivery Check */}
{/* Delivery Check – premium styled */}
<form onSubmit={checkPin} className="pt-3">
  <div className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
    <TruckIcon className="h-5 w-5 text-brand" />
    <span>Check Delivery Availability</span>
  </div>
  <div className="flex max-w-md gap-2 bg-neutral-50 border border-gray-200 rounded-lg p-2">
    <input
      value={pin}
      onChange={(e) => setPin(e.target.value)}
      placeholder="Enter pincode"
      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
    />
    <button
      type="submit"
      className="rounded-md bg-brand px-4 py-2 text-white text-sm hover:bg-brand-dark transition"
    >
      Check
    </button>
  </div>
  {deliveryMsg && (
    <div className="mt-2 text-sm text-gray-700 flex items-center gap-2 animate-fadeIn">
      <TruckIcon className="h-4 w-4 text-green-600" />
      {deliveryMsg}
    </div>
  )}
</form>

      {/* Trust Section */}
{/* Trust Section – redesigned */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-neutral-50 p-3">
    <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
    <div>
      <div className="text-sm font-medium text-gray-900">Secure Payments</div>
      <div className="text-xs text-gray-500">UPI, Cards, Netbanking</div>
    </div>
  </div>

  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-neutral-50 p-3">
    <TruckIcon className="h-6 w-6 text-blue-600" />
    <div>
      <div className="text-sm font-medium text-gray-900">Free Shipping</div>
      <div className="text-xs text-gray-500">On orders above ₹599</div>
    </div>
  </div>

  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-neutral-50 p-3">
    <ArrowPathRoundedSquareIcon className="h-6 w-6 text-orange-600" />
    <div>
      <div className="text-sm font-medium text-gray-900">Easy Returns</div>
      <div className="text-xs text-gray-500">Return policy</div>
    </div>
  </div>
</div>

    </div>
  )
}
