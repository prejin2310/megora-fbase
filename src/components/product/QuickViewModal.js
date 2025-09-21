"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon, ShoppingBagIcon, BellAlertIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import toast from "react-hot-toast"

import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { useAuth } from "@/context/AuthContext"
import { getColorCode } from "@/lib/colors"
import { createNotifyRequest } from "@/lib/notify"

export default function QuickViewModal({ open, onClose, product }) {
  const cartContext = useCart() || {}
  const wishlistContext = useWishlist() || {}
  const auth = useAuth()

  const { addItem = () => {} } = cartContext
  const { toggleWishlist = () => {} } = wishlistContext
  const { user } = auth || { user: null }

  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [notifyEmail, setNotifyEmail] = useState(user?.email || "")
  const [savingNotify, setSavingNotify] = useState(false)
  const [colorTooltip, setColorTooltip] = useState(null)
  const tooltipTimer = useRef(null)
  const notifyInputRef = useRef(null)

  // ✅ useMemo hooks
  const variants = useMemo(() => {
    if (!product?.variants) return []
    return Array.isArray(product.variants)
      ? product.variants
      : Object.values(product.variants)
  }, [product])

  const firstVariant = useMemo(() => {
    if (variants.length === 0) return {}
    const withStock = variants.find(
      (variant) => Number(variant?.stock ?? variant?.inventory ?? 0) > 0
    )
    return withStock || variants[0]
  }, [variants])

  const imageGallery = useMemo(() => {
    const variantImages = selectedVariant?.images || []
    if (variantImages.length > 0) return variantImages
    return product?.media || []
  }, [selectedVariant, product])

  const colorOptions = useMemo(() => {
    const colours = new Set()
    variants.forEach((variant) => {
      variant?.options?.forEach((option) => {
        if (option?.title?.toLowerCase() === "color" && option?.name) {
          colours.add(option.name)
        }
      })
    })
    return Array.from(colours)
  }, [variants])

  // ✅ useEffect hooks
  useEffect(() => {
    setSelectedVariant(firstVariant || null)
  }, [firstVariant])

  useEffect(() => {
    const initialImage =
      selectedVariant?.images?.[0]?.url || product?.media?.[0]?.url || "/demo/product1.jpg"
    setSelectedImage(initialImage)
  }, [selectedVariant, product])

  useEffect(() => {
    setNotifyEmail(user?.email || "")
  }, [user?.email])

  useEffect(() => {
    return () => window.clearTimeout(tooltipTimer.current || undefined)
  }, [])

  // Derived values
  const priceINR = Number(
    selectedVariant?.option?.priceINR ||
      selectedVariant?.priceINR ||
      selectedVariant?.prices?.INR ||
      product?.priceINR ||
      0
  )

  const mrpINRRaw =
    selectedVariant?.fakePriceINR ||
    selectedVariant?.prices?.MRP ||
    product?.mrpINR ||
    null
  const mrpINR = mrpINRRaw != null ? Number(mrpINRRaw) : null

  const stockValue =
    selectedVariant?.stock ?? selectedVariant?.inventory ?? product?.stock ?? 0
  const totalStock = Number(stockValue) || 0
  const outOfStock = totalStock <= 0

  // Handlers
  const handleSelectVariant = (variantId) => {
    const match = variants.find((variant) => variant?.id === variantId)
    if (match) setSelectedVariant(match)
  }

  const handleSelectOption = (title, name) => {
    const normalisedTitle = (title || "").toLowerCase()
    const match = variants.find((variant) =>
      variant?.options?.some(
        (option) => option?.title?.toLowerCase() === normalisedTitle && option?.name === name
      )
    )
    if (match) setSelectedVariant(match)
  }

  const handleAddToCart = () => {
    const heroImage =
      selectedVariant?.images?.[0]?.url || product?.media?.[0]?.url || "/demo/product1.jpg"

    if (outOfStock) {
      toast("This variant is currently out of stock", { icon: "!" })
      return
    }

    addItem({
      id: product.id,
      title: product.title,
      slug: product.handle,
      price: priceINR,
      qty: 1,
      image: heroImage,
      sku: selectedVariant?.sku || product?.sku || product?.handle,
      variant: selectedVariant?.option?.name || selectedVariant?.title || "default",
    })
    toast.success("Added to cart")
    onClose?.()
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
        variant: selectedVariant,
        userId: user?.uid || null,
      })
      toast.success("We will let you know as soon as it is back")
      onClose?.()
    } catch (error) {
      console.error("quick-view notify", error)
      toast.error("Could not save your request")
    } finally {
      setSavingNotify(false)
    }
  }

  const showColorTooltip = (color) => {
    window.clearTimeout(tooltipTimer.current || undefined)
    setColorTooltip(color)
  }

  const hideColorTooltip = () => {
    window.clearTimeout(tooltipTimer.current || undefined)
    tooltipTimer.current = window.setTimeout(() => setColorTooltip(null), 900)
  }

  const handleColorClick = (color) => {
    showColorTooltip(color)
    handleSelectOption("color", color)
    hideColorTooltip()
  }

  const handlePrimaryAction = () => {
    if (outOfStock) {
      notifyInputRef.current?.focus()
      return
    }
    handleAddToCart()
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* ✅ If product missing, fallback UI */}
        {!product ? (
          <div className="flex min-h-[200px] items-center justify-center bg-white rounded-2xl">
            <p className="text-gray-500">No product found.</p>
          </div>
        ) : (
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-10">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-brand/10 bg-white shadow-[0_35px_75px_-35px_rgba(0,61,58,0.45)]">
                  {/* close button */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-gray-500 transition hover:text-brand"
                    aria-label="Close quick view"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>

                  {/* main content */}
                  <div className="grid gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-10">
                    {/* left: images */}
                    <div className="space-y-4">
                      <div className="relative overflow-hidden rounded-[28px] bg-brand-light">
                        <Image
                          src={selectedImage || "/demo/product1.jpg"}
                          alt={product?.title || "Product image"}
                          width={640}
                          height={720}
                          className="h-full w-full max-h-[520px] rounded-[28px] object-cover"
                        />
                      </div>
                      {imageGallery.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto">
                          {imageGallery.map((img, index) => {
                            const src = img?.url || img
                            if (!src) return null
                            return (
                              <button
                                key={`${src}-${index}`}
                                type="button"
                                onClick={() => setSelectedImage(src)}
                                className={clsx(
                                  "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border transition",
                                  selectedImage === src
                                    ? "border-brand shadow"
                                    : "border-brand/10 hover:border-brand"
                                )}
                              >
                                <Image
                                  src={src}
                                  alt={`${product?.title || "Product"} ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* right: details */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Dialog.Title className="text-2xl font-semibold text-brand">
                          {product?.title || "Product"}
                        </Dialog.Title>
                        {product?.subtitle && (
                          <p className="text-sm text-gray-500">{product.subtitle}</p>
                        )}
                        {product?.description && (
                          <p className="text-sm leading-relaxed text-gray-600">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-semibold text-brand">
                          ₹{priceINR.toLocaleString("en-IN")}
                        </span>
                        {mrpINR && mrpINR > priceINR && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{mrpINR.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Variants */}
                      {variants.length > 1 && (
                        <div className="space-y-3">
                          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                            Select variant
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {variants.map((variant) => (
                              <button
                                key={variant?.id || variant?.title}
                                type="button"
                                onClick={() => handleSelectVariant(variant?.id)}
                                className={clsx(
                                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                                  selectedVariant?.id === variant?.id
                                    ? "border-brand bg-brand/10 text-brand"
                                    : "border-brand/20 text-gray-600 hover:border-brand/40"
                                )}
                              >
                                {variant?.option?.name || variant?.title || "Variant"}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Colors */}
                      {colorOptions.length > 0 && (
                        <div className="space-y-3">
                          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                            Colour
                          </span>
                          <div className="flex items-center gap-3">
                            {colorOptions.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => handleColorClick(color)}
                                onPointerEnter={() => showColorTooltip(color)}
                                onPointerLeave={hideColorTooltip}
                                className={clsx(
                                  "relative h-6 w-6 rounded-full border-2",
                                  colorTooltip === color ? "border-brand" : "border-white"
                                )}
                                style={{ backgroundColor: getColorCode(color) }}
                                aria-label={`Colour ${color}`}
                              >
                                <span className="sr-only">{color}</span>
                                {colorTooltip === color && (
                                  <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-brand px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                                    {color}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stock info */}
                      <div className="text-sm text-gray-600">
                        {outOfStock ? (
                          <span className="text-rose-600">Currently out of stock</span>
                        ) : (
                          <span className="text-emerald-600">
                            In stock • {totalStock} available
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={handlePrimaryAction}
                          disabled={savingNotify && outOfStock}
                          className={clsx(
                            "flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition",
                            outOfStock
                              ? "bg-brand/80 hover:bg-brand disabled:cursor-not-allowed"
                              : "bg-brand hover:bg-brand/90"
                          )}
                        >
                          {outOfStock ? (
                            <>
                              <BellAlertIcon className="h-5 w-5" />
                              {savingNotify ? "Saving..." : "Notify me"}
                            </>
                          ) : (
                            <>
                              <ShoppingBagIcon className="h-5 w-5" />
                              Add to cart
                            </>
                          )}
                        </button>
                        <Link
                          href={`/product/${product.handle || ""}`}
                          className="flex flex-1 items-center justify-center rounded-full border border-brand/30 px-6 py-3 text-sm font-semibold text-brand transition hover:bg-brand/10"
                        >
                          View full details
                        </Link>
                      </div>

                      {/* Notify form */}
                      {outOfStock && (
                        <form
                          onSubmit={handleNotifySubmit}
                          className="space-y-3 rounded-2xl border border-brand/15 bg-brand-light/60 p-4"
                        >
                          <p className="text-sm font-semibold text-brand">
                            Get notified when this returns
                          </p>
                          <input
                            ref={notifyInputRef}
                            type="email"
                            value={notifyEmail}
                            onChange={(event) => setNotifyEmail(event.target.value)}
                            placeholder="you@example.com"
                            className="w-full rounded-full border border-brand/20 px-4 py-2 text-sm text-gray-700 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                            required
                          />
                          <button
                            type="submit"
                            disabled={savingNotify}
                            className="w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingNotify ? "Saving..." : "Notify me"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        )}
      </Dialog>
    </Transition>
  )
}
