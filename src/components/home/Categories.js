// src/components/home/Categories.js
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { collection, query, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

const DEFAULT_IMAGE = "/demo/default-category.jpg"

export default function Categories() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const q = query(collection(db, "categories"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name,
          slug: data.slug,
          imageUrl: data.imageUrl || DEFAULT_IMAGE,
        }
      })
      setCategories(cats.slice(0, 6)) // ✅ show only 6
    })

    return () => unsubscribe()
  }, [])

  return (
    <section className="bg-brand-light py-12">
      <div className="w-full px-4">
        {/* Heading */}
        <h2 className="mb-10 text-center font-playfair text-4xl font-bold text-brand">
          Shop by Category
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="relative aspect-square w-full overflow-hidden rounded-xl group shadow-md"
            >
              {/* Image */}
              <Image
                src={cat.imageUrl || DEFAULT_IMAGE}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_IMAGE
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition"></div>

              {/* Centered Title */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-2">
                <h3 className="font-semibold text-lg sm:text-xl drop-shadow">
                  {cat.name}
                </h3>
                <span className="mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand shadow group-hover:bg-brand group-hover:text-white transition">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
