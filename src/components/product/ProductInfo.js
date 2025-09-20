"use client"

import { useMemo, useState } from "react"
import { StarIcon } from "@heroicons/react/20/solid"
import {
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathRoundedSquareIcon,
  TagIcon,
  CubeIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline"
import toast from "react-hot-toast"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { getColorCode } from "@/lib/colors"

// --- helpers to read color/size from mixed schemas ---
function getColor(v) {
  const t = v.option?.title?.toLowerCase()
  if (t === "color") return v.option?.name || null
  return v.attributes?.color || null
}
function getSize(v) {
  const t = v.option?.title?.toLowerCase()
  if (t === "size") return v.option?.name || null
  return v.attributes?.size || null
}
function uniq(arr) {
  return [...new Set(arr.filter(Boolean))]
}

export default function ProductInfo({ product, variant, setVariant, categoryName, reviews = [] }) {
  const { addItem, buyNow } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()

  const [qty, setQty] = useState(1)
  const [pin, setPin] = useState("")
  const [deliveryMsg, setDeliveryMsg] = useState("")

  if (!product) return null
  const variants = product.variants || []

  // build option groups from all variants
  const allColors = useMemo(() => uniq(variants.map(getColor)), [variants])
  const allSizes  = useMemo(() => uniq(variants.map(getSize)), [variants])

  // current selected options derived from selectedVariant
  const currentColor = useMemo(() => (variant ? getColor(variant) : null), [variant])
  const currentSize  = useMemo(() => (variant ? getSize(variant)  : null), [variant])

  // availability maps for disabling impossible combos
  const sizesForColor = useMemo(() => {
    const map = new Map()
    for (const c of allColors) {
      const sizes = uniq(
        variants.filter(v => getColor(v) === c && v.stock > 0).map(getSize)
      )
      map.set(c, sizes)
    }
    return map
  }, [variants, allColors])

  const colorsForSize = useMemo(() => {
    const map = new Map()
    for (const s of allSizes) {
      const colors = uniq(
        variants.filter(v => getSize(v) === s && v.stock > 0).map(getColor)
      )
      map.set(s, colors)
    }
    return map
  }, [variants, allSizes])

  // find variant by desired combo (with fallback)
  const pickVariant = (desiredColor, desiredSize) => {
    // perfect match
    let found =
      variants.find(v => getColor(v) === desiredColor && getSize(v) === desiredSize && v.stock > 0) ||
      variants.find(v => getColor(v) === desiredColor && getSize(v) === desiredSize)

    if (found) return found

    // fallback 1: any with color + any size (prefer stock)
    if (desiredColor) {
      found =
        variants.find(v => getColor(v) === desiredColor && v.stock > 0) ||
        variants.find(v => getColor(v) === desiredColor)
      if (found) return found
    }

    // fallback 2: any with size + any color (prefer stock)
    if (desiredSize) {
      found =
        variants.find(v => getSize(v) === desiredSize && v.stock > 0) ||
        variants.find(v => getSize(v) === desiredSize)
      if (found) return found
    }

    // fallback 3: any in-stock, else first
    return variants.find(v => v.stock > 0) || variants[0] || null
  }

  // handlers
  const onSelectColor = (color) => {
    const next = pickVariant(color, currentSize)
    setVariant(next)
  }
  const onSelectSize = (size) => {
    const next = pickVariant(currentColor, size)
    setVariant(next)
  }

  const avg = reviews?.length
    ? (reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : 0

  const cartPayload = {
    id: product.id,
    title: product.title,
    slug: product.handle,
    price: variant?.price,
    compareAtPrice: variant?.fakePrice,
    qty,
    image: variant?.images?.[0] || product.defaultImages?.[0] || "/placeholder.png",
    option: {
      color: currentColor || undefined,
      size: currentSize || undefined,
    },
    sku: product.sku,
  }

  const handleAddToCart = () => {
    if (!variant) return toast.error("Please select a variant")
    addItem(cartPayload)
    toast.success("Added to cart")
  }

  const handleBuyNow = () => {
    if (!variant) return toast.error("Please select a variant")
    buyNow(cartPayload)
  }

  const checkPin = (e) => {
    e.preventDefault()
    if (!pin || pin.length < 6) return setDeliveryMsg("Please enter a valid 6-digit pincode.")
    setDeliveryMsg("Estimated delivery: 3–7 days.")
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{product.title}</h1>

      {/* Rating */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(i => (
            <StarIcon key={i} className={`h-4 w-4 ${i <= Math.round(avg) ? "text-yellow-400" : "text-gray-300"}`} />
          ))}
        </div>
        <span>{avg} out of 5</span>
        <span>·</span>
        <span>{reviews?.length || 0} reviews</span>
      </div>

      {/* Price + Stock */}
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold text-gray-900">
          {variant?.price != null ? `₹${variant.price}` : "—"}
        </span>
        {variant?.fakePrice ? (
          <span className="text-lg text-gray-500 line-through">₹{variant.fakePrice}</span>
        ) : null}
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

      {/* Variant pickers */}
      {variants.length > 0 && (
        <div className="space-y-4">
          {/* Colors */}
          {allColors.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Color</div>
              <div className="flex gap-2 flex-wrap">
                {allColors.map((c) => {
                  const disabled =
                    currentSize && !colorsForSize.get(currentSize)?.includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onSelectColor(c)}
                      disabled={disabled}
                      className={`h-8 w-8 rounded-full border-2 transition
                        ${currentColor === c ? "border-brand ring-2 ring-brand" : "border-gray-300"}
                        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                      `}
                      style={{ backgroundColor: getColorCode(c) }}
                      title={c}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {allSizes.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Size</div>
              <div className="flex gap-2 flex-wrap">
                {allSizes.map((s) => {
                  const disabled =
                    currentColor && !sizesForColor.get(currentColor)?.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onSelectSize(s)}
                      disabled={disabled}
                      className={`px-3 py-1 rounded-full border text-sm transition
                        ${currentSize === s ? "border-brand bg-brand text-white" : "border-gray-300 hover:border-gray-500"}
                        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                      `}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Qty */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-gray-300">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">–</button>
          <span className="min-w-10 text-center">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2">+</button>
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

      {/* Meta */}
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

      {/* Delivery */}
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
          <button type="submit" className="rounded-md bg-brand px-4 py-2 text-white text-sm hover:bg-brand-dark transition">
            Check
          </button>
        </div>
        {deliveryMsg && (
          <div className="mt-2 text-sm text-gray-700 flex items-center gap-2">
            <TruckIcon className="h-4 w-4 text-green-600" />
            {deliveryMsg}
          </div>
        )}
      </form>

      {/* Trust (kept as before) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-neutral-50 p-3">
          <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">Secure Payments</div>
            <div className="text-xs text-gray-500">UPI, Cards, Netbanking</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-neutral-50 p-3">
          <TruckIcon className="h-6 w-6" />
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
