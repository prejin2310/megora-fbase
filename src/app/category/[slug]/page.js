"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, limit, startAfter } from "firebase/firestore"
import Image from "next/image"

const DEFAULT_IMAGE = "/demo/default-product.jpg"
const PAGE_SIZE = 9 // products per page

export default function CategoryPage() {
  const { slug } = useParams()
  const [products, setProducts] = useState([])
  const [lastDoc, setLastDoc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [noMore, setNoMore] = useState(false)

  const fetchProducts = async (loadMore = false) => {
    setLoading(true)
    try {
      let q = query(
        collection(db, "products"),
        where("categorySlug", "==", slug),
        limit(PAGE_SIZE)
      )
      if (loadMore && lastDoc) {
        q = query(
          collection(db, "products"),
          where("categorySlug", "==", slug),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        )
      }

      const snap = await getDocs(q)
      if (snap.empty) {
        setNoMore(true)
        return
      }

      const newProducts = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setProducts((prev) => (loadMore ? [...prev, ...newProducts] : newProducts))
      setLastDoc(snap.docs[snap.docs.length - 1])
      if (snap.docs.length < PAGE_SIZE) setNoMore(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(false)
  }, [slug])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">
        {slug.replace(/-/g, " ")}
      </h1>

      {/* Grid of products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white shadow rounded-lg overflow-hidden group">
            <div className="relative aspect-square w-full">
              <Image
                src={p.imageUrl || DEFAULT_IMAGE}
                alt={p.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{p.name}</h3>
              <p className="text-sm text-gray-500 mt-1">₹{p.price}</p>
            </div>
          </div>
        ))}
        {products.length === 0 && !loading && (
          <p className="col-span-full text-center text-gray-500">No products found.</p>
        )}
      </div>

      {/* Load More */}
      <div className="mt-8 flex justify-center">
        {!noMore && (
          <button
            onClick={() => fetchProducts(true)}
            disabled={loading}
            className="px-6 py-2 rounded bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        )}
      </div>
    </div>
  )
}
