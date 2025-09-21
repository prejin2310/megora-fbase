"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"

import { getNewArrivals } from "@/lib/db"
import { useCart } from "@/context/CartContext"

const REFRESH_INTERVAL = 1000

const pad = (value) => value.toString().padStart(2, "0")

const getEndOfDay = () => {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return end
}

const computeRemaining = (target) => {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) {
    return { total: 0, hours: "00", minutes: "00", seconds: "00" }
  }
  const totalSeconds = Math.floor(diff / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return {
    total: diff,
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  }
}

const getDailyIndex = (length) => {
  if (!length) return 0
  const now = new Date()
  const daySeed = Number(`${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`)
  return daySeed % length
}

const extractVariants = (item) => {
  if (!item?.variants) return []
  return Array.isArray(item.variants) ? item.variants : Object.values(item.variants)
}

const hasAvailableStock = (item) => {
  if (!item) return false
  const variants = extractVariants(item)
  if (variants.length > 0) {
    return variants.some((variant) => Number(variant?.stock ?? variant?.inventory ?? 0) > 0)
  }
  return Number(item?.stock ?? 0) > 0
}

const selectDealProduct = (items) => {
  if (!Array.isArray(items) || items.length === 0) return null
  const available = items.filter(hasAvailableStock)
  if (available.length === 0) return null
  const index = getDailyIndex(available.length)
  return available[index]
}

export default function DealOfDay() {
  const cartContext = useCart() || {}
  const { addItem = () => {} } = cartContext

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [target, setTarget] = useState(getEndOfDay())
  const [remaining, setRemaining] = useState(() => computeRemaining(getEndOfDay()))

  useEffect(() => {
    let mounted = true
    const loadDeal = async () => {
      try {
        const items = await getNewArrivals(10)
        if (!mounted) return
        if (Array.isArray(items) && items.length > 0) {
          const deal = selectDealProduct(items)
          setProduct(deal || null)
        } else {
          setProduct(null)
        }
      } catch (error) {
        console.error("deal-of-day", error)
        if (mounted) setProduct(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadDeal()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((prev) => {
        const next = computeRemaining(target)
        if (next.total <= 0) {
          const nextTarget = getEndOfDay()
          setTarget(nextTarget)
          return computeRemaining(nextTarget)
        }
        return next
      })
    }, REFRESH_INTERVAL)
    return () => window.clearInterval(timer)
  }, [target])

  const variants = useMemo(() => extractVariants(product), [product])

  const primaryVariant = variants[0] || {}

  const rawPrice =
    primaryVariant?.option?.priceINR ||
    primaryVariant?.priceINR ||
    primaryVariant?.prices?.INR ||
    product?.priceINR ||
    0
  const rawMrp =
    primaryVariant?.fakePriceINR ||
    primaryVariant?.prices?.MRP ||
    product?.mrpINR ||
    null

  const priceINR = Number(rawPrice) || 0
  const mrpINR = rawMrp != null ? Number(rawMrp) : null

  const discount = useMemo(() => {
    if (!priceINR || !mrpINR || mrpINR <= priceINR) return null
    return Math.round(((mrpINR - priceINR) / mrpINR) * 100)
  }, [priceINR, mrpINR])

  const heroImage =
    primaryVariant?.images?.[0]?.url || product?.media?.[0]?.url || "/demo/product1.jpg"

  const hasStock = hasAvailableStock(product)

  const handleAddToCart = () => {
    if (!product) return
    if (!hasStock) {
      toast.error("This deal is currently out of stock.")
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
    toast.success("Deal added to cart")
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFEEDD] via-[#FFF6EF] to-white py-20 text-brand">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#F6D9C4] to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 md:flex-row md:items-center">
        <div className="relative w-full overflow-hidden rounded-[32px] border border-brand/10 bg-white shadow-2xl md:w-2/5">
          <div className="relative aspect-[4/5]">
            {loading ? (
              <div className="absolute inset-0 animate-pulse rounded-[32px] bg-brand/10" />
            ) : (
              <Image
                src={heroImage}
                alt={product?.title || "Deal of the day"}
                fill
                sizes="(min-width: 1024px) 380px, 90vw"
                className="object-cover"
              />
            )}
          </div>
          {!loading && discount && (
            <div className="absolute right-4 top-4 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30">
              Save {discount}%
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.32em] text-brand/60">
            <span className="rounded-full border border-brand/20 px-3 py-1">Deal of the day</span>
            <span className="rounded-full border border-brand/20 px-3 py-1">Ends tonight</span>
          </div>
          <h2 className="font-playfair text-3xl leading-tight text-brand md:text-4xl">
            Limited-hour pricing on our artisan highlight.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-brand/70">
            A collector favourite with lifetime plating support and complimentary polishing vouchers. Once the timer resets, a new piece is featured automatically.
          </p>

          <div className="flex items-center gap-6">
            <TimePill label="Hours" value={remaining.hours} />
            <TimePill label="Minutes" value={remaining.minutes} />
            <TimePill label="Seconds" value={remaining.seconds} />
          </div>

          {!loading && product && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-brand/60">Featured piece</p>
                <Link
                  href={`/product/${product.handle || ""}`}
                  className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-brand underline-offset-4 hover:underline"
                >
                  {product.title}
                </Link>
              </div>
              <div className="flex items-center gap-4 text-lg font-semibold">
                <span className="text-2xl text-brand">{"\u20B9" + priceINR.toLocaleString("en-IN")}</span>
                {mrpINR && mrpINR > priceINR && (
                  <span className="text-base text-brand/40 line-through">
                    {"\u20B9" + mrpINR.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!hasStock}
                  className="flex flex-1 items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:shadow-xl disabled:cursor-not-allowed disabled:bg-brand/40"
                >
                  {hasStock ? "Add to cart" : "Coming soon"}
                </button>
                <Link
                  href={`/product/${product.handle || ""}`}
                  className="flex flex-1 items-center justify-center rounded-full border border-brand/20 px-6 py-3 text-sm font-semibold text-brand transition hover:bg-brand/10"
                >
                  View product
                </Link>
              </div>
            </div>
          )}

          {!loading && !product && (
            <div className="rounded-3xl border border-brand/10 bg-white/85 p-6 text-sm text-brand/60">
              Today&apos;s highlight is being prepared. Check back soon.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function TimePill({ label, value }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-brand/10 bg-white px-6 py-4 shadow-inner shadow-brand/5">
      <span className="text-3xl font-semibold text-brand">{value}</span>
      <span className="mt-1 text-xs tracking-[0.2em] text-brand/60">{label}</span>
    </div>
  )
}















