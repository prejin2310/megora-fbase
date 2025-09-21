"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { db, auth } from "@/lib/firebase"
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Image from "next/image"
import clsx from "clsx"
import toast from "react-hot-toast"
import Link from "next/link"

import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"

import Breadcrumbs from "@/components/product/Breadcrumbs"
import ProductTabs from "@/components/product/ProductTabs"
import ProductReviews from "@/components/product/ProductReviews"
import ProductSimilar from "@/components/product/ProductSimilar"

import { StarIcon, HeartIcon } from "@heroicons/react/20/solid"
import { TruckIcon, ShoppingBagIcon } from "@heroicons/react/24/outline"

import { getColorCode } from "@/lib/colors"

const inr = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(n || 0))

function getDiscount(p, mrp) {
  if (!p || !mrp || mrp <= p) return null
  return Math.round(((mrp - p) / mrp) * 100)
}

function toPlainText(value) {
  if (typeof value !== "string") return ""
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4 animate-pulse">
          <div className="relative overflow-hidden rounded-[32px] bg-neutral-200/80">
            <div className="aspect-[4/5]" />
          </div>
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 w-24 flex-shrink-0 rounded-2xl bg-neutral-200/80"
              />
            ))}
          </div>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-1/3 rounded-full bg-neutral-200/80" />
          <div className="h-10 w-3/4 rounded-full bg-neutral-200/80" />
          <div className="h-4 w-2/3 rounded-full bg-neutral-200/80" />
          <div className="h-12 w-1/3 rounded-full bg-neutral-200/80" />
          <div className="h-20 w-full rounded-3xl bg-neutral-200/80" />
          <div className="h-12 w-40 rounded-full bg-neutral-200/80" />
        </div>
      </div>
    </div>
  )
}

function FadeImage({ src, alt, className, sizes, ...props }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200" />
      )}
      <Image
        src={src}
        alt={alt}
        sizes={sizes || "100vw"}
        onLoadingComplete={() => setLoaded(true)}
        className={clsx(
          "h-full w-full object-cover transition-all duration-700 ease-out",
          loaded ? "scale-100 opacity-100" : "scale-105 opacity-0",
          className
        )}
        {...props}
      />
    </div>
  )
}

export default function ProductPage() {
  const params = useParams()
  const slug = typeof params?.slug === "string" ? params.slug : ""
  const router = useRouter()

  const cart = useCart()
  const wishlist = useWishlist()
  const { addItem = () => {}, buyNow = () => {} } = cart ?? {}
  const { toggleWishlist = () => {}, isWishlisted = () => false } = wishlist ?? {}

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [product, setProduct] = useState(null)
  const [category, setCategory] = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])

  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [mainImg, setMainImg] = useState("/placeholder.png")

  const [qty, setQty] = useState(1)
  const [pin, setPin] = useState("")
  const [deliveryMsg, setDeliveryMsg] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => setUser(authUser))
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!slug) return

    const run = async () => {
      try {
        setLoading(true)
        setError(false)

        const productQuery = query(
          collection(db, "products"),
          where("handle", "==", slug),
          limit(1)
        )
        const snapshot = await getDocs(productQuery)

        if (snapshot.empty) {
          setError(true)
          router.replace("/")
          return
        }

        const docRef = snapshot.docs[0]
        const data = { id: docRef.id, ...docRef.data() }
        setProduct(data)
        setQty(1)

        if (data.categoryId) {
          const categoryDoc = await getDoc(doc(db, "categories", data.categoryId))
          if (categoryDoc.exists()) {
            setCategory({ id: categoryDoc.id, ...categoryDoc.data() })
          } else {
            setCategory(null)
          }
        } else {
          setCategory(null)
        }

        if (data.categoryId) {
          const relatedQuery = query(
            collection(db, "products"),
            where("categoryId", "==", data.categoryId),
            limit(6)
          )
          const relatedSnapshot = await getDocs(relatedQuery)
          const relatedProducts = relatedSnapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }))
            .filter((item) => item.id !== docRef.id)
          setRelated(relatedProducts)
        } else {
          setRelated([])
        }

        const reviewQuery = query(
          collection(db, "products", docRef.id, "reviews"),
          orderBy("createdAt", "desc")
        )
        const reviewSnapshot = await getDocs(reviewQuery)
        setReviews(reviewSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })))

        const variants = Object.values(data.variants || {})
        if (variants.length > 0) {
          const firstVariant = variants[0]
          const colorOption =
            firstVariant.options?.find(
              (option) => option.title?.toLowerCase() === "color"
            )?.name || null

          setSelectedVariant(firstVariant)
          setSelectedColor(colorOption)

          const initialImage =
            firstVariant.images?.[0]?.url || data.media?.[0]?.url || "/placeholder.png"
          setMainImg(initialImage)
        } else {
          const fallbackImage = data.media?.[0]?.url || "/placeholder.png"
          setMainImg(fallbackImage)
          setSelectedVariant(null)
          setSelectedColor(null)
        }
      } catch (fetchError) {
        console.error(fetchError)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [slug, router])

  useEffect(() => {
    if (!product || !selectedColor) return

    const variants = Object.values(product.variants || {})
    if (variants.length === 0) return

    const matchingVariant =
      variants.find((variant) =>
        variant.options?.some(
          (option) => option.title?.toLowerCase() === "color" && option.name === selectedColor
        )
      ) || variants[0]

    setSelectedVariant(matchingVariant)

    const variantImage =
      matchingVariant?.images?.[0]?.url || product.media?.[0]?.url || "/placeholder.png"
    setMainImg(variantImage)
  }, [selectedColor, product])

  if (loading) {
    return (
      <div className="relative z-0 bg-gradient-to-b from-[#FDFBED] via-white to-white pt-[120px] md:pt-[144px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[72px] h-[280px] bg-[radial-gradient(circle_at_top,_rgba(245,214,180,0.25),_transparent_70%)]"
        />
        <Breadcrumbs loading bgColor="transparent" />
        <ProductSkeleton />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white pt-[120px]">
        <p className="text-center text-lg font-semibold text-rose-500">
          Product not found. Please explore our latest collections.
        </p>
      </div>
    )
  }

  const safeProduct = product || {}
  const variants = Object.values(safeProduct.variants || {})
  const colorOptions = [
    ...new Set(
      variants
        .map((variant) =>
          variant.options?.find((option) => option.title?.toLowerCase() === "color")?.name
        )
        .filter(Boolean)
    ),
  ]

  const variantImages = (() => {
    const images =
      (selectedVariant?.images || []).map((image) => image?.url).filter(Boolean) || []

    if (images.length > 0) {
      return images
    }

    const fallback = (safeProduct.media || []).map((media) => media?.url).filter(Boolean)
    if (fallback.length > 0) {
      return fallback
    }

    return ["/placeholder.png"]
  })()

  const averageRating = reviews.length
    ? Number(
        (
          reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) /
          reviews.length
        ).toFixed(1)
      )
    : 0

  const currentPrice =
    selectedVariant?.option?.priceINR ||
    selectedVariant?.prices?.INR ||
    safeProduct.priceINR ||
    0

  const fakePrice =
    selectedVariant?.fakePriceINR || selectedVariant?.prices?.MRP || safeProduct.mrpINR || null

  const discount = getDiscount(currentPrice, fakePrice)

  const variantStockRaw =
    selectedVariant?.stock ?? selectedVariant?.inventory ?? safeProduct.stock ?? null

  const variantHasStock =
    typeof variantStockRaw === "number" ? variantStockRaw > 0 : Boolean(variantStockRaw)

  const disableActions = !selectedVariant || !variantHasStock

  const productSummarySource =
    toPlainText(safeProduct.shortDescription) || toPlainText(safeProduct.description)

  const trimmedSummary =
    productSummarySource.length > 220
      ? `${productSummarySource.slice(0, 217)}...`
      : productSummarySource

  const reviewLabel =
    reviews.length > 0 ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "No reviews yet"

  const checkPin = (event) => {
    event.preventDefault()
    if (!pin || pin.trim().length < 6) {
      setDeliveryMsg("Please enter a valid 6-digit pincode.")
      return
    }

    setDeliveryMsg("Estimated delivery: 3-7 business days.")
  }

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add items to cart.")
      router.push("/login")
      return
    }

    if (!selectedVariant) {
      toast.error("Please select a variant first.")
      return
    }

    addItem({
      id: safeProduct.id,
      title: safeProduct.title,
      slug: safeProduct.handle,
      price: currentPrice,
      qty,
      image: selectedVariant.images?.[0]?.url || safeProduct.media?.[0]?.url,
      sku: safeProduct.sku,
      variant: selectedVariant.option?.name,
    })

    toast.success("Added to your cart.")
    router.push("/cart")
  }

  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast.error("Please select a variant first.")
      return
    }

    const orderItem = {
      id: safeProduct.id,
      title: safeProduct.title,
      slug: safeProduct.handle,
      price: currentPrice,
      qty,
      variant: selectedColor || "default",
      image: selectedVariant.images?.[0]?.url || safeProduct.media?.[0]?.url,
      sku: safeProduct.sku,
    }

    buyNow(orderItem)
    const queryStr = `?buyNow=${encodeURIComponent(JSON.stringify(orderItem))}`
    router.push(`/checkout${queryStr}`)
  }

  return (
    <div className="relative z-0 bg-gradient-to-b from-[#FDFBED] via-white to-white pt-[120px] md:pt-[144px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[72px] h-[280px] bg-[radial-gradient(circle_at_top,_rgba(245,214,180,0.25),_transparent_70%)]"
      />
      <Breadcrumbs
        product={{
          ...safeProduct,
          categoryName: category?.name,
          categorySlug: category?.slug,
        }}
        bgColor="transparent"
      />
      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-[88px_1fr]">
              <div className="hidden sm:flex flex-col gap-3">
                {variantImages.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setMainImg(img)}
                    className={clsx(
                      "group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border",
                      mainImg === img
                        ? "border-brand bg-white"
                        : "border-transparent bg-white/60 hover:border-brand/40"
                    )}
                  >
                    <FadeImage
                      src={img}
                      alt={`${safeProduct.title || "Product"} thumbnail ${index + 1}`}
                      fill
                      sizes="120px"
                    />
                  </button>
                ))}
              </div>
              <div className="relative mx-auto w-full overflow-hidden rounded-[32px] bg-white/70 shadow-sm">
                <div className="relative aspect-[4/5] w-full">
                  <FadeImage
                      src={mainImg}
                      alt={safeProduct.title || "Product image"}
                      fill
                      priority
                      sizes="(min-width: 1024px) 540px, (min-width: 768px) 70vw, 92vw"
                    />
                </div>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto sm:hidden snap-x snap-mandatory pb-1">
              {variantImages.map((img, index) => (
                <button
                  key={`${img}-mobile-${index}`}
                  type="button"
                  onClick={() => setMainImg(img)}
                  className={clsx(
                    "relative aspect-[4/5] w-24 flex-shrink-0 overflow-hidden rounded-2xl border snap-center",
                    mainImg === img
                      ? "border-brand bg-white"
                      : "border-transparent bg-white/60 hover:border-brand/40"
                  )}
                >
                  <FadeImage
                    src={img}
                    alt={`${safeProduct.title || "Product"} thumbnail ${index + 1}`}
                    fill
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand/80">
                {category?.name && (
                  <Link
                    href={`/category/${category.slug}`}
                    className="rounded-full border border-brand/20 px-3 py-1 text-[11px] text-brand transition-colors hover:bg-brand/10"
                  >
                    {category.name}
                  </Link>
                )}
                {safeProduct.tags?.[0] && (
                  <span className="rounded-full border border-white/40 bg-white/70 px-3 py-1 text-[11px] text-gray-600">
                    {safeProduct.tags[0]}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-semibold leading-tight text-gray-900 md:text-4xl">
                {safeProduct.title}
              </h1>
              {trimmedSummary && (
                <p className="max-w-xl text-sm leading-relaxed text-gray-600">{trimmedSummary}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const ratingIndex = index + 1
                    return (
                      <StarIcon
                        key={ratingIndex}
                        className={clsx(
                          "h-4 w-4",
                          ratingIndex <= Math.round(averageRating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    )
                  })}
                </div>
                <span className="font-medium text-gray-900">
                  {averageRating.toFixed(1)} / 5
                </span>
                <span className="text-gray-300">|</span>
                <span>{reviewLabel}</span>
              </div>
              <div className="flex flex-wrap items-end gap-4 pt-2">
                <span className="text-3xl font-semibold text-gray-900">
                  {inr(currentPrice)}
                </span>
                {fakePrice && (
                  <span className="text-base text-gray-500 line-through">
                    {inr(fakePrice)}
                  </span>
                )}
                {discount && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Save {discount}%
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                {safeProduct.sku && (
                  <span className="font-medium text-gray-600">
                    SKU: <span className="font-semibold text-gray-900">{safeProduct.sku}</span>
                  </span>
                )}
                {category?.name && (
                  <span>
                    Category:{" "}
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-brand hover:underline"
                    >
                      {category.name}
                    </Link>
                  </span>
                )}
              </div>
            </div>
            {colorOptions.length > 0 && (
              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-800">Colour</span>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={clsx(
                        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                        selectedColor === color
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-gray-200 text-gray-600 hover:border-brand/40 hover:text-brand"
                      )}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-white shadow-inner"
                        style={{ backgroundColor: getColorCode(color) }}
                      />
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-gray-200 bg-white/80">
                <button
                  type="button"
                  onClick={() => setQty((value) => Math.max(1, value - 1))}
                  className="px-4 py-2 text-lg font-semibold text-gray-600 transition hover:text-gray-900"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-semibold text-gray-900">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((value) => value + 1)}
                  className="px-4 py-2 text-lg font-semibold text-gray-600 transition hover:text-gray-900"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    toast.error("Please login to use wishlist.")
                    router.push("/login")
                    return
                  }
                  toggleWishlist(safeProduct)
                }}
                className={clsx(
                  "flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition",
                  isWishlisted?.(safeProduct.id)
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-gray-200 text-gray-600 hover:border-brand/40 hover:text-brand"
                )}
              >
                <HeartIcon className="h-4 w-4" />
                {isWishlisted?.(safeProduct.id) ? "Wishlisted" : "Add to wishlist"}
              </button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={disableActions}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={disableActions}
                className="flex flex-1 items-center justify-center rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
            <div className="space-y-3 border-t border-white/60 pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <TruckIcon className="h-5 w-5 text-brand" />
                Delivery & Support
              </div>
              <form onSubmit={checkPin} className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center rounded-full border border-gray-200 bg-white/80 px-4 py-2">
                  <input
                    value={pin}
                    onChange={(event) => setPin(event.target.value)}
                    placeholder="Enter your pincode"
                    className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                >
                  Check
                </button>
              </form>
              {deliveryMsg && (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <TruckIcon className="h-4 w-4" />
                  {deliveryMsg}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-16 space-y-10">
          <div className="rounded-3xl bg-white/80 p-6 shadow-sm backdrop-blur">
            <ProductTabs product={safeProduct} />
          </div>
          <div className="rounded-3xl bg-white/80 p-6 shadow-sm backdrop-blur">
            <ProductReviews product={safeProduct} reviews={reviews} />
          </div>
          <div className="rounded-3xl bg-white/80 p-6 shadow-sm backdrop-blur">
            <ProductSimilar related={related} />
          </div>
        </div>
      </section>
    </div>
  )
}













