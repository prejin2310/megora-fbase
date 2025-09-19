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
      const cats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setCategories(cats.slice(0, 6)) // ✅ Only 6 categories
    })

    return () => unsubscribe()
  }, [])

  return (
    <section className="bg-brand-light py-16">
      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
        {/* Heading */}
        <h2 className="mb-10 text-center font-playfair text-3xl font-bold text-brand">
          Shop by Category
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0">
          {categories.map((cat, i) => (
            <Link
              key={i}
              href={`/category/${cat.slug || cat.name.toLowerCase()}`}
              className="relative aspect-square w-full overflow-hidden group"
            >
              {/* Background image */}
              <Image
                src={cat.image || DEFAULT_IMAGE}
                alt={cat.name}
                fill
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_IMAGE
                }}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition"></div>

              {/* Content */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div>
                  <h3 className="font-medium text-lg">{cat.name}</h3>
                  <p className="text-xs text-gray-200">{cat.itemCount || 0} items</p>
                </div>
                {/* Arrow */}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand shadow group-hover:bg-brand group-hover:text-white transition">
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
