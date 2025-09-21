"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import clsx from "clsx"
import { Dialog, Transition } from "@headlessui/react"
import { HeartIcon, ShoppingBagIcon, EyeIcon, BellAlertIcon } from "@heroicons/react/24/outline"
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
  const [notifyEmail, setNotifyEmail] = useState(user?.email || "")
  const [savingNotify, setSavingNotify] = useState(false)
  const [activeColor, setActiveColor] = useState(null)
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

  const displayedColors = colorOptions.slice(0, 4)
  const extraColors = Math.max(colorOptions.length - displayedColors.length, 0)

  const wishlistActive = Boolean(isWishlisted?.(product?.id))

  const showColorTooltip = (color) => {
    window.clearTimeout(tooltipTimer.current || undefined)
    setActiveColor(color)
  }

  const scheduleHideTooltip = () => {
    window.clearTimeout(tooltipTimer.current || undefined)
    tooltipTimer.current = window.setTimeout(() => setActiveColor(null), 900)
  }

  const handleColorPointerEnter = (color) => showColorTooltip(color)
  const handleColorPointerLeave = () => scheduleHideTooltip()
  const handleColorClick = (color) => {
    showColorTooltip(color)
    scheduleHideTooltip()
  }

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
      <article className="group relative flex h-full w-full max-w-[240px] flex-col border border-brand/10 bg-white shadow-[0_30px_55px_-34px_rgba(0,61,58,0.4)] transition-transform hover:-translate-y-1">
        <div className="relative">
          <Link href={`/product/${product?.handle || ""}`} className="block">
            <div className="relative overflow-hidden">
              <Image
                src={heroImage}
                alt={product?.title || "Megora product"}
                width={320}
                height={380}
                className={clsx(
                  "h-64 w-full object-cover transition-opacity duration-500",
                  hoverImage ? "opacity-100 group-hover:opacity-0" : ""
                )}
                sizes="(min-width: 1280px) 220px, (min-width: 768px) 40vw, 80vw"
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={`${product?.title || "Megora product"} alternate view`}
                  width={320}
                  height={380}
                  className="absolute inset-0 h-64 w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  sizes="(min-width: 1280px) 220px, (min-width: 768px) 40vw, 80vw"
                />
              )}
            </div>
          </Link>

          {limitedStock && (
            <span className="absolute left-3 top-3 bg-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
              Limited
            </span>
          )}
          {outOfStock && (
            <span className="absolute inset-x-3 bottom-3 bg-white/95 px-4 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-600">
              Out of stock
            </span>
          )}

          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleWishlist}
              aria-label="Toggle wishlist"
              className={clsx(
                "flex h-9 w-9 items-center justify-center border bg-white/95 text-gray-600 shadow-sm transition",
                wishlistActive ? "border-amber-300 text-amber-600" : "border-white/70 hover:border-brand/40 hover:text-brand"
              )}
            >
              <HeartIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setQuickView(true)}
              aria-label="Quick view"
              className="flex h-9 w-9 items-center justify-center border border-white/70 bg-white/95 text-gray-600 shadow-sm transition hover:border-brand/40 hover:text-brand"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>

          {limitedStock && (
            <span className="absolute left-3 top-3 bg-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
              Limited
            </span>
          )}
          {outOfStock && (
            <span className="absolute inset-x-3 bottom-3 bg-white/95 px-4 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-600">
              Out of stock
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-3">
          <div className="space-y-2">
            <Link
              href={`/product/${product?.handle || ""}`}
              className="line-clamp-2 text-base font-semibold text-brand"
            >
              {product?.title || "Untitled piece"}
            </Link>
            <div className="flex items-baseline gap-3 text-sm">
              <span className="text-lg font-semibold text-brand">
                ₹{priceINR.toLocaleString("en-IN")}
              </span>
              {mrpINR && mrpINR > priceINR && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{mrpINR.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          {colorOptions.length > 0 && (
            <div className="flex flex-col gap-2 text-xs text-gray-500">
              <span>Colours</span>
              <div className="flex items-center gap-3">
                {displayedColors.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleColorClick(name)}
                    onPointerEnter={() => handleColorPointerEnter(name)}
                    onPointerLeave={handleColorPointerLeave}
                    className="relative h-5 w-5 border border-white shadow"
                    style={{ backgroundColor: getColorCode(name) }}
                    aria-label={`Colour ${name}`}
                  >
                    <span className="sr-only">{name}</span>
                    {activeColor === name && (
                      <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 bg-brand px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                        {name}
                      </span>
                    )}
                  </button>
                ))}
                {extraColors > 0 && (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                    +{extraColors}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              {outOfStock ? (
                <>
                  <BellAlertIcon className="h-5 w-5" />
                  Notify me
                </>
              ) : (
                <>
                  <ShoppingBagIcon className="h-5 w-5" />
                  Add to cart
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setQuickView(true)}
              className="flex w-full items-center justify-center gap-2 border border-brand/20 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
            >
              Quick view
            </button>
          </div>
        </div>
      </article>

      <QuickViewModal open={quickView} onClose={() => setQuickView(false)} product={product} />

      <Transition appear show={notifyOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setNotifyOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-6">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md border border-brand/10 bg-white p-6 shadow-xl">
                  <Dialog.Title className="text-lg font-semibold text-brand">
                    Notify me when available
                  </Dialog.Title>
                  <p className="mt-2 text-sm text-gray-600">
                    Leave your email and we will send a restock alert for {product?.title || "this piece"}.
                  </p>
                  <form onSubmit={handleNotifySubmit} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="notify-email" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="notify-email"
                        type="email"
                        value={notifyEmail}
                        onChange={(event) => setNotifyEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="w-full border border-brand/20 px-4 py-2 text-sm text-gray-700 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={savingNotify}
                        className="flex-1 bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingNotify ? "Saving..." : "Notify me"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifyOpen(false)}
                        className="flex-1 border border-brand/20 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

