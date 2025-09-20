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
import toast from "react-hot-toast"

import Breadcrumbs from "@/components/product/Breadcrumbs"
import ProductGallery from "@/components/product/ProductGallery"
import ProductInfo from "@/components/product/ProductInfo"
import ProductTabs from "@/components/product/ProductTabs"
import ProductReviews from "@/components/product/ProductReviews"
import ProductSimilar from "@/components/product/ProductSimilar"

function normalizeProduct(data, id) {
  const variantsArr = Object.values(data.variants || {})
  return {
    id,
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    handle: data.handle,
    sku: data.sku,
    categoryId: data.categoryId,
    variants: variantsArr.map((v) => ({
      id: v.id,
      stock: Number(v.stock) || 0,
      price: v.option?.priceINR || v.prices?.INR,
      fakePrice: v.fakePriceINR,
      option: v.option,
      images: v.images?.map((i) => i.url) || [],
      attributes: v.attributes || {},
    })),
    defaultImages: data.media?.map((m) => m.url) || [],
    attributes: data.attributes || {},
  }
}

export default function ProductPage() {
  const { slug } = useParams()
  const router = useRouter()

  const [product, setProduct] = useState(null)
  const [category, setCategory] = useState(null) // store full category (name + slug)
  const [related, setRelated] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [reviews, setReviews] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(false)

        // 🔹 Fetch product by slug
        const q = query(collection(db, "products"), where("handle", "==", slug), limit(1))
        const snap = await getDocs(q)
        if (snap.empty) {
          setError(true)
          router.replace("/")
          return
        }

        const docRef = snap.docs[0]
        const data = { id: docRef.id, ...docRef.data() }
        const normalized = normalizeProduct(data, docRef.id)
        setProduct(normalized)
        setSelectedVariant(normalized.variants[0] || null)

        // 🔹 Fetch category doc
        if (data.categoryId) {
          const catRef = doc(db, "categories", data.categoryId)
          const catSnap = await getDoc(catRef)
          if (catSnap.exists()) {
            setCategory({ id: catSnap.id, ...catSnap.data() })
          }
        }

        // 🔹 Fetch related
        if (data.categoryId) {
          const relQ = query(
            collection(db, "products"),
            where("categoryId", "==", data.categoryId),
            limit(6)
          )
          const relSnap = await getDocs(relQ)
          const rel = relSnap.docs
            .map((d) => normalizeProduct(d.data(), d.id))
            .filter((p) => p.id !== docRef.id)
          setRelated(rel)
        }

        // 🔹 Fetch reviews
        const rQ = query(
          collection(db, "products", docRef.id, "reviews"),
          orderBy("createdAt", "desc")
        )
        const rSnap = await getDocs(rQ)
        setReviews(rSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchProduct()
  }, [slug, router])

  if (loading) {
    return (
      <div className="p-10 animate-pulse text-center text-neutral-500">
        <div className="h-6 w-32 bg-neutral-200 mx-auto mb-4 rounded"></div>
        <div className="h-80 bg-neutral-200 rounded"></div>
        <p className="mt-4">Loading product details…</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="p-20 text-center text-rose-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z"
          />
        </svg>
        <p className="mt-3 font-medium">Product not found or failed to load.</p>
      </div>
    )
  }

  return (
    <div className="bg-white relative z-0 pt-[72px]">
      {/* Breadcrumbs with category name + slug */}
      {/* Breadcrumbs with category name + slug */}
<Breadcrumbs
  product={{
    ...product,
    categoryName: category?.name,
    categorySlug: category?.slug,
  }}
  loading={loading}
  bgColor="#FDFBED"
/>


      {/* Main two-column layout */}
      <div className="mx-auto max-w-7xl grid gap-10 px-4 py-8 md:grid-cols-2">
        {/* Left: Product Gallery */}
        <ProductGallery
          images={selectedVariant?.images?.length ? selectedVariant.images : product.defaultImages}
          title={product.title}
          variant={selectedVariant}
        />

        {/* Right: Product Info */}
        <ProductInfo
          product={product}
          variant={selectedVariant}
          setVariant={setSelectedVariant}
          categoryName={category?.name}
          reviews={reviews}
        />
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
