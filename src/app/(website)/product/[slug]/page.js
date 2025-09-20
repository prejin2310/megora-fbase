"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
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

/* ----------------- Helpers ----------------- */
const inr = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(n || 0))

function getDiscount(p, mrp) {
  if (!p || !mrp || mrp <= p) return null
  return Math.round(((mrp - p) / mrp) * 100)
}

/* ----------------- Page ----------------- */
export default function ProductPage() {
  const { slug } = useParams()
  const router = useRouter()
  const { addItem, buyNow } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()

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

  /* ----------------- Fetch product ----------------- */
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(false)

        const q = query(collection(db, "products"), where("handle", "==", slug), limit(1))
        const snap = await getDocs(q)
        if (snap.empty) {
          setError(true)
          router.replace("/")
          return
        }

        const docRef = snap.docs[0]
        const data = { id: docRef.id, ...docRef.data() }
        setProduct(data)

        // Category
        if (data.categoryId) {
          const catSnap = await getDoc(doc(db, "categories", data.categoryId))
          if (catSnap.exists()) {
            setCategory({ id: catSnap.id, ...catSnap.data() })
          }
        }

        // Related
        if (data.categoryId) {
          const relQ = query(
            collection(db, "products"),
            where("categoryId", "==", data.categoryId),
            limit(6)
          )
          const relSnap = await getDocs(relQ)
          const rel = relSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((p) => p.id !== docRef.id)
          setRelated(rel)
        }

        // Reviews
        const rQ = query(
          collection(db, "products", docRef.id, "reviews"),
          orderBy("createdAt", "desc")
        )
        const rSnap = await getDocs(rQ)
        setReviews(rSnap.docs.map((d) => ({ id: d.id, ...d.data() })))

        // Variants
        const variants = Object.values(data.variants || {})
        if (variants.length > 0) {
          const firstColor =
            variants[0].options?.find((o) => o.title?.toLowerCase() === "color")?.name ||
            null
          setSelectedColor(firstColor)
          setSelectedVariant(variants[0])
          setMainImg(
            variants[0].images?.[0]?.url ||
              data.media?.[0]?.url ||
              "/placeholder.png"
          )
        }
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    if (slug) run()
  }, [slug, router])

  /* ----------------- Update variant on color change ----------------- */
  useEffect(() => {
    if (!product || !selectedColor) return
    const variants = Object.values(product.variants || {})
    const match =
      variants.find((v) =>
        v.options?.some(
          (o) => o.title?.toLowerCase() === "color" && o.name === selectedColor
        )
      ) || variants[0]
    setSelectedVariant(match)
    if (match?.images?.length) setMainImg(match.images[0].url)
  }, [selectedColor, product])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 animate-pulse">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="h-[500px] bg-neutral-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-neutral-200 rounded" />
            <div className="h-6 w-1/3 bg-neutral-200 rounded" />
            <div className="h-10 w-40 bg-neutral-200 rounded" />
            <div className="h-6 w-2/3 bg-neutral-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) return <div className="p-20 text-center text-rose-600">Product not found.</div>

  const variants = Object.values(product.variants || {})
  const colorOptions = [
    ...new Set(
      variants
        .map((v) =>
          v.options?.find((o) => o.title?.toLowerCase() === "color")?.name
        )
        .filter(Boolean)
    ),
  ]

  const variantImages =
    selectedVariant?.images?.map((img) => img.url) ||
    product.media?.map((m) => m.url) ||
    ["/placeholder.png"]

  const avg = reviews?.length
    ? (
        reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0) / reviews.length
      ).toFixed(1)
    : 0

  const currentPrice =
    selectedVariant?.option?.priceINR ||
    selectedVariant?.prices?.INR ||
    product.priceINR ||
    0
  const fakePrice =
    selectedVariant?.fakePriceINR ||
    selectedVariant?.prices?.MRP ||
    null
  const discount = getDiscount(currentPrice, fakePrice)

  /* ----------------- Cart / Buy ----------------- */
  const handleAddToCart = () => {
    if (!selectedVariant) return toast.error("Please select a variant")
    addItem({
      id: product.id,
      title: product.title,
      slug: product.handle,
      price: currentPrice,
      qty,
      image: selectedVariant.images?.[0]?.url || product.media?.[0]?.url,
      sku: product.sku,
    })
    toast.success("Added to cart")
  }

  const handleBuyNow = () => {
    if (!selectedVariant) return toast.error("Please select a variant")
    buyNow({
      id: product.id,
      title: product.title,
      slug: product.handle,
      price: currentPrice,
      qty,
      image: selectedVariant.images?.[0]?.url || product.media?.[0]?.url,
      sku: product.sku,
    })
  }

  /* ----------------- Delivery check ----------------- */
  const checkPin = (e) => {
    e.preventDefault()
    if (!pin || pin.length < 6)
      return setDeliveryMsg("Please enter a valid 6-digit pincode.")
    setDeliveryMsg("Estimated delivery: 3–7 days 🚚")
  }

  return (
    <div className="bg-white relative z-0 pt-[72px]">
      {/* Breadcrumbs */}
      <Breadcrumbs
        product={{
          ...product,
          categoryName: category?.name,
          categorySlug: category?.slug,
        }}
        loading={loading}
        bgColor="#FDFBED"
      />

      {/* Layout */}
      <div className="mx-auto max-w-7xl grid gap-10 px-4 py-8 md:grid-cols-2">
        {/* Gallery */}
        <div className="w-full grid md:grid-cols-[80px_1fr] gap-3">
          {/* Desktop thumbnails */}
          <div className="hidden md:flex md:flex-col gap-3 overflow-y-auto max-h-[500px]">
            {variantImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImg(img)}
                className={clsx(
                  "relative aspect-square w-[70px] flex-shrink-0 overflow-hidden rounded-lg border transition",
                  mainImg === img
                    ? "border-brand ring-2 ring-brand"
                    : "border-neutral-200 hover:border-neutral-400"
                )}
              >
                <Image
                  src={img}
                  alt={`${product.title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="70px"
                />
              </button>
            ))}
          </div>

          {/* Main preview */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-100">
            <Image
              src={mainImg}
              alt={product.title}
              fill
              priority
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Mobile thumbnails */}
        <div className="flex gap-3 overflow-x-auto md:hidden mt-3">
          {variantImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setMainImg(img)}
              className={clsx(
                "relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border transition",
                mainImg === img
                  ? "border-brand ring-2 ring-brand"
                  : "border-neutral-200 hover:border-neutral-400"
              )}
            >
              <Image
                src={img}
                alt={`${product.title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="space-y-5 md:space-y-6">
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">
            {product.title}
          </h1>

          {/* Price & Offer */}
          <div className="flex items-center gap-3">
            {fakePrice && (
              <span className="text-lg text-gray-500 line-through">
                {inr(fakePrice)}
              </span>
            )}
            <span className="text-2xl font-bold text-gray-900">
              {inr(currentPrice)}
            </span>
            {discount && (
              <span className="text-sm font-medium text-emerald-600">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* SKU + Category */}
          <div className="text-sm text-gray-600">
            {product.sku && <span className="mr-4">SKU: {product.sku}</span>}
            {category?.name && (
              <span>
                Category:{" "}
                <Link href={`/category/${category.slug}`} className="text-brand hover:underline">
                  {category.name}
                </Link>
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i <= Math.round(avg) ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span>{avg} out of 5</span> · <span>{reviews.length} reviews</span>
          </div>

          {/* Color Variants */}
          {colorOptions.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Color</div>
              <div className="flex gap-3 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm",
                      selectedColor === c
                        ? "border-2 border-brand ring-1 ring-brand"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: getColorCode(c) }}
                    />
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Wishlist */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-gray-300">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">–</button>
              <span className="min-w-10 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2">+</button>
            </div>
            <button
              onClick={() => toggleWishlist(product)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                isWishlisted?.(product.id)
                  ? "border-amber-500 text-amber-700"
                  : "border-gray-300 hover:border-gray-500"
              }`}
            >
              <HeartIcon
                className={`h-4 w-4 ${
                  isWishlisted?.(product.id) ? "text-amber-600" : "text-gray-400"
                }`}
              />
              {isWishlisted?.(product.id) ? "Wishlisted" : "Add to Wishlist"}
            </button>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant?.stock}
              className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-white shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 w-full md:w-auto justify-center"
            >
              <ShoppingBagIcon className="h-5 w-5" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!selectedVariant?.stock}
              className="rounded-lg border border-brand px-6 py-3 text-brand hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50 w-full md:w-auto"
            >
              Buy Now
            </button>
          </div>

          {/* Delivery */}
          <form onSubmit={checkPin} className="pt-3">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <TruckIcon className="h-5 w-5 text-brand" />
              <span>Check Delivery Availability</span>
            </div>
            <div className="flex max-w-md gap-2 bg-neutral-50 border border-gray-200 rounded-lg p-2">
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter pincode"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
              />
              <button type="submit" className="rounded-md bg-brand px-4 py-2 text-white text-sm">
                Check
              </button>
            </div>
            {deliveryMsg && (
              <div className="mt-2 text-sm text-gray-700 flex items-center gap-2 animate-fadeIn">
                <TruckIcon className="h-4 w-4 text-green-600" /> {deliveryMsg}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Tabs / Reviews / Similar */}
      <div className="mx-auto max-w-7xl px-4 space-y-10 pb-16">
        <ProductTabs product={product} />
        <ProductReviews product={product} reviews={reviews} />
        <ProductSimilar related={related} />
      </div>
    </div>
  )
}
