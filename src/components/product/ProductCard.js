"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import clsx from "clsx"
import { Dialog, Transition } from "@headlessui/react"
import {
  HeartIcon,
  ShoppingBagIcon,
  EyeIcon,
  BellAlertIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"
import toast from "react-hot-toast"

import QuickViewModal from "@/components/product/QuickViewModal"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { useAuth } from "@/context/AuthContext"
import { createNotifyRequest } from "@/lib/notify"
import { getColorCode } from "@/lib/colors"

export default function ProductCard({ product }) {
  const cartContext = useCart() || {}
  const wishlistContext = useWishlist() || {}
  const auth = useAuth()

  const { addItem = () => {} } = cartContext
  const { toggleWishlist = () => {}, isWishlisted = () => false } = wishlistContext
  const { user } = auth || { user: null }

  const [quickView, setQuickView] = useState(false)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [preBookOpen, setPreBookOpen] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(user?.email || "")
  const [savingNotify, setSavingNotify] = useState(false)
  const tooltipTimer = useRef(null)

  useEffect(() => {
    setNotifyEmail(user?.email || "")
  }, [user?.email])

  useEffect(() => () => window.clearTimeout(tooltipTimer.current || undefined), [])

  const variants = useMemo(() => {
    if (!product?.variants) return []
    return Array.isArray(product.variants) ? product.variants : Object.values(product.variants)
  }, [product])

  const primaryVariant = useMemo(() => {
    if (variants.length === 0) return {}
    const withStock = variants.find((variant) => Number(variant?.stock ?? variant?.inventory ?? 0) > 0)
    return withStock || variants[0]
  }, [variants])

  const heroImage =
    primaryVariant?.images?.[0]?.url || product?.media?.[0]?.url || "/demo/product1.jpg"
  const hoverImage =
    primaryVariant?.images?.[1]?.url || product?.media?.[1]?.url || null

  const priceINR = Number(
    primaryVariant?.option?.priceINR ||
      primaryVariant?.priceINR ||
      primaryVariant?.prices?.INR ||
      product?.priceINR ||
      0
  )

  const mrpINRRaw =
    primaryVariant?.fakePriceINR ||
    primaryVariant?.prices?.MRP ||
    product?.mrpINR ||
    null
  const mrpINR = mrpINRRaw != null ? Number(mrpINRRaw) : null

  const stockValue =
    primaryVariant?.stock ?? primaryVariant?.inventory ?? product?.stock ?? 0
  const totalStock = Number(stockValue) || 0
  const outOfStock = totalStock <= 0
  const limitedStock = !outOfStock && totalStock <= 5

  const colorOptions = useMemo(() => {
    const colours = new Set()
    variants.forEach((variant) => {
      variant?.options?.forEach((option) => {
        if (option?.title?.toLowerCase() === "color" && option?.name) colours.add(option.name)
      })
    })
    return Array.from(colours)
  }, [variants])

  const wishlistActive = Boolean(isWishlisted?.(product?.id))

  const safeTitle = product?.title || "this Megora piece"
  const whatsappMessage = encodeURIComponent(
    `Hello Megora team, I'd like to pre-book the "${safeTitle}" from your website.`
  )
  const whatsappPrebookUrl = `https://wa.me/917736166728?text=${whatsappMessage}`

  const handleWishlist = () => {
    if (!product) return
    toggleWishlist(product)
  }

  const handleAddToCart = () => {
    if (!product) return
    if (outOfStock) {
      setNotifyOpen(true)
      return
    }

    addItem({
      id: product.id,
      title: product.title,
      slug: product.handle,
      price: priceINR,
      qty: 1,
      image: heroImage,
      sku: primaryVariant?.sku || product?.sku || product?.handle,
      variant: primaryVariant?.option?.name || primaryVariant?.title || "default",
    })
    toast.success("Added to cart")
  }

  const handleNotifySubmit = async (event) => {
    event.preventDefault()
    const trimmedEmail = notifyEmail.trim()
    if (!trimmedEmail) {
      toast.error("Please enter an email address")
      return
    }
    try {
      setSavingNotify(true)
      await createNotifyRequest({
        email: trimmedEmail,
        product,
        variant: primaryVariant,
        userId: user?.uid || null,
      })
      toast.success("We will notify you as soon as it is back")
      setNotifyOpen(false)
    } catch (error) {
      console.error("notify-me", error)
      toast.error("Could not save your request. Please try again")
    } finally {
      setSavingNotify(false)
    }
  }

  return (
    <>
      <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg sm:max-w-[220px] animate-fadeIn">
        {/* Image wrapper with fixed ratio */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Link href={`/product/${product?.handle || ""}`} className="block relative h-full w-full">
            <Image
              src={heroImage}
              alt={product?.title || "Megora product"}
              fill
              className={clsx(
                "object-cover transition duration-500",
                outOfStock ? "opacity-60 grayscale" : "",
                hoverImage ? "opacity-100 group-hover:opacity-0" : ""
              )}
              sizes="(min-width: 1280px) 220px, (min-width: 768px) 33vw, 50vw"
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={`${product?.title} alt view`}
                fill
                className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </Link>

{/* Badges */}
{limitedStock && !outOfStock && (
  <span className="absolute left-2 top-2 rounded-md bg-brand-light px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-brand shadow-sm">
    Limited Stock
  </span>
)}
{outOfStock && (
  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-bold uppercase tracking-wide text-white">
    Out of Stock
  </span>
)}


          {/* Icons */}
          <div className="absolute right-2 top-2 flex flex-col gap-2">
            <button
              onClick={handleWishlist}
              className={clsx(
                "flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md",
                wishlistActive ? "text-red-500" : "text-gray-600"
              )}
            >
              <HeartIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setQuickView(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:text-brand"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-3">
          <Link
            href={`/product/${product?.handle || ""}`}
            className="line-clamp-1 text-sm font-semibold text-gray-800 hover:text-brand"
          >
            {product?.title}
          </Link>

{/* Inline Price + Colors */}
<div className="flex items-center justify-between">
  {/* Price side */}
  <div className="flex items-baseline gap-2">
    <span className="text-lg font-bold text-brand md:text-xl">
      {"₹" + priceINR.toLocaleString("en-IN")}
    </span>
    {mrpINR && mrpINR > priceINR && (
      <span className="text-sm text-gray-400 line-through">
        {"₹" + mrpINR.toLocaleString("en-IN")}
      </span>
    )}
  </div>

  {/* Colors side */}
  {colorOptions.length > 0 && (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-gray-500">Colors:</span>
      {colorOptions.slice(0, 3).map((name) => (
        <div
          key={name}
          className={clsx(
            "h-4 w-4 rounded-full border shadow-sm",
            name.toLowerCase() === "white" ? "border-gray-300" : "border-transparent"
          )}
          style={{ backgroundColor: getColorCode(name) }}
          title={name}
        />
      ))}
    </div>
  )}
</div>




          {/* Buttons */}
          <div className="mt-auto flex flex-col gap-2">
            {outOfStock ? (
              <>
                <button
                  type="button"
                  onClick={() => setPreBookOpen(true)}
                  className="flex w-full items-center justify-center gap-1 rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white"
                >
                  <InformationCircleIcon className="h-4 w-4" />
                  Pre-book
                </button>
                <button
                  type="button"
                  onClick={() => setNotifyOpen(true)}
                  className="flex w-full items-center justify-center gap-1 rounded-full border border-brand/30 px-3 py-2 text-xs font-semibold text-brand"
                >
                  <BellAlertIcon className="h-4 w-4" />
                  Notify Me
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white"
                >
                  <ShoppingBagIcon className="h-4 w-4" />
                  Add to cart
                </button>
                {/* Secondary for balance */}
                <button
                  type="button"
                  onClick={() => setQuickView(true)}
                  className="flex w-full items-center justify-center gap-1 rounded-full border border-brand/30 px-3 py-2 text-xs font-semibold text-brand"
                >
                  <EyeIcon className="h-4 w-4" />
                  Quick View
                </button>
              </>
            )}
          </div>
        </div>
      </article>

      {/* Quick View */}
      <QuickViewModal open={quickView} onClose={() => setQuickView(false)} product={product} />

      {/* Notify Modal */}
      <Transition appear show={notifyOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setNotifyOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6">
              <Dialog.Title className="text-lg font-semibold text-brand">Notify Me</Dialog.Title>
              <form onSubmit={handleNotifySubmit} className="mt-4 space-y-3">
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={savingNotify} className="flex-1 rounded bg-brand px-3 py-2 text-sm font-semibold text-white">
                    {savingNotify ? "Saving..." : "Notify Me"}
                  </button>
                  <button type="button" onClick={() => setNotifyOpen(false)} className="flex-1 rounded border px-3 py-2 text-sm font-semibold text-brand">
                    Cancel
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

      {/* Pre-book Modal */}
      <Transition appear show={preBookOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setPreBookOpen(false)}>
          <div className="fixed inset-0 bg-black/40" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-sm rounded-lg bg-white p-6">
              <Dialog.Title className="text-lg font-semibold text-brand">Pre-book via WhatsApp</Dialog.Title>
              <p className="mt-2 text-sm text-gray-600">
                Out of stock? Don’t worry! You can pre-book this product. Delivery takes 10-15 days (just 5-7 days extra).
              </p>
              <a
                href={whatsappPrebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                Chat on WhatsApp
              </a>
              <button
                onClick={() => setPreBookOpen(false)}
                className="mt-3 w-full rounded border px-4 py-2 text-sm font-semibold text-brand"
              >
                Cancel
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
