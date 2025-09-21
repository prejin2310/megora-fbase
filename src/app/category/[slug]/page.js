"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, limit, startAfter } from "firebase/firestore"
import Image from "next/image"

const DEFAULT_IMAGE = "/demo/default-product.jpg"
const PAGE_SIZE = 9

export default function CategoryPage() {
  const { slug } = useParams()
  const [products, setProducts] = useState([])
  const [lastDoc, setLastDoc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [noMore, setNoMore] = useState(false)

  const fetchProducts = useCallback(
    async ({ append = false, cursor = null } = {}) => {
      setLoading(true)
      try {
        let q = query(
          collection(db, "products"),
          where("categorySlug", "==", slug),
          limit(PAGE_SIZE)
        )

        if (append && cursor) {
          q = query(
            collection(db, "products"),
            where("categorySlug", "==", slug),
            startAfter(cursor),
            limit(PAGE_SIZE)
          )
        }

        const snap = await getDocs(q)
        const docs = snap.docs

        if (append && docs.length === 0) {
          setNoMore(true)
          return
        }

        const newProducts = docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setProducts((prev) => (append ? [...prev, ...newProducts] : newProducts))
        setLastDoc(docs[docs.length - 1] ?? null)
        setNoMore(docs.length < PAGE_SIZE)
      } finally {
        setLoading(false)
      }
    },
    [slug]
  )

  useEffect(() => {
    setProducts([])
    setLastDoc(null)
    setNoMore(false)
    if (slug) {
      fetchProducts({ append: false })
    }
  }, [slug, fetchProducts])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">
        {slug.replace(/-/g, " ")}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden group">
            <div className="relative aspect-square w-full">
              <Image
                src={product.imageUrl || DEFAULT_IMAGE}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                unoptimized={Boolean(product.imageUrl)}
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Rs. {product.price}</p>
            </div>
          </div>
        ))}
        {products.length === 0 && !loading && (
          <p className="col-span-full text-center text-gray-500">No products found.</p>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        {!noMore && (
          <button
            onClick={() => fetchProducts({ append: true, cursor: lastDoc })}
            disabled={loading || !lastDoc}
            className="px-6 py-2 rounded bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        )}
      </div>
    </div>
  )
}
