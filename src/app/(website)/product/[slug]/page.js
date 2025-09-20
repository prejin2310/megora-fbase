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

import { StarIcon } from "@heroicons/react/20/solid"
import {
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathRoundedSquareIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline"

/* ----------------- Helpers ----------------- */
const inr = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(n || 0))

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

  if (loading) return <div className="p-10 text-center">Loading…</div>
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
      <div className="mx-auto max-w-7xl grid gap-8 px-4 py-8 md:grid-cols-2">
        {/* Gallery */}
        <div className="w-full grid md:grid-cols-[70px_1fr] gap-2">
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[480px]">
            {variantImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImg(img)}
                className={clsx(
                  "relative aspect-square w-16 md:w-[60px] flex-shrink-0 overflow-hidden rounded-lg border transition",
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
                  sizes="60px"
                />
              </button>
            ))}
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-100">
            <Image
              src={mainImg}
              alt={product.title}
              fill
              priority
              className="object-cover hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-5">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-gray-600">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarIcon
                key={i}
                className={`h-3.5 w-3.5 ${
                  i <= Math.round(avg) ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span>{avg} / 5</span> · <span>{reviews.length} reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {inr(currentPrice)}
            </span>
            {selectedVariant?.stock > 0 ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                In stock
              </span>
            ) : (
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                Out of stock
              </span>
            )}
          </div>

          {/* Color Variants */}
          {colorOptions.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-medium text-gray-700">Color</div>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1 rounded-md border text-xs font-medium ${
                      selectedColor === c
                        ? "border-brand bg-brand text-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Wishlist */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded border border-gray-300">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-2 py-1 text-sm">–</button>
              <span className="min-w-8 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-2 py-1 text-sm">+</button>
            </div>
            <button
              onClick={() => toggleWishlist(product)}
              className={`rounded border px-3 py-1 text-xs ${
                isWishlisted?.(product.id)
                  ? "border-amber-500 text-amber-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {isWishlisted?.(product.id) ? "Wishlisted" : "Wishlist"}
            </button>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant?.stock}
              className="flex items-center gap-1 rounded bg-brand px-4 py-2 text-sm text-white"
            >
              <ShoppingBagIcon className="h-4 w-4" /> Add
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!selectedVariant?.stock}
              className="rounded border border-brand px-4 py-2 text-sm text-brand hover:bg-brand/5"
            >
              Buy Now
            </button>
          </div>

          {/* SKU + Category */}
          <div className="text-xs text-gray-700 space-y-0.5">
            {product.sku && <div><span className="font-medium">SKU:</span> {product.sku}</div>}
            {category?.name && (
              <div>
                <span className="font-medium">Category:</span>{" "}
                <Link href={`/category/${category.slug}`} className="text-brand hover:underline">
                  {category.name}
                </Link>
              </div>
            )}
          </div>

          {/* Delivery */}
          <form onSubmit={checkPin} className="pt-2 space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium">
              <TruckIcon className="h-4 w-4 text-brand" />
              Check Delivery
            </div>
            <div className="flex max-w-xs gap-1">
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Pincode"
                className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs outline-none"
              />
              <button type="submit" className="rounded bg-brand px-3 py-1 text-xs text-white">
                Go
              </button>
            </div>
            {deliveryMsg && (
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <TruckIcon className="h-3 w-3 text-green-600" /> {deliveryMsg}
              </div>
            )}
          </form>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-2 pt-4">
            <div className="flex items-center gap-2 rounded border border-gray-200 bg-neutral-50 p-2">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
              <span className="text-[11px] font-medium">Secure</span>
            </div>
            <div className="flex items-center gap-2 rounded border border-gray-200 bg-neutral-50 p-2">
              <TruckIcon className="h-4 w-4 text-blue-600" />
              <span className="text-[11px] font-medium">Free Ship</span>
            </div>
            <div className="flex items-center gap-2 rounded border border-gray-200 bg-neutral-50 p-2">
              <ArrowPathRoundedSquareIcon className="h-4 w-4 text-orange-600" />
              <span className="text-[11px] font-medium">Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Reviews / Similar */}
      <div className="mx-auto max-w-7xl px-4 space-y-8 pb-12">
        <ProductTabs product={product} />
        <ProductReviews product={product} reviews={reviews} />
        <ProductSimilar related={related} />
      </div>
    </div>
  )
}
