"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { collection, onSnapshot, query } from "firebase/firestore"

import { db } from "@/lib/firebase"

const FALLBACK_IMAGE = "/demo/default-category.jpg"

export default function Categories() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const q = query(collection(db, "categories"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data() || {}
        return {
          id: doc.id,
          name: data.name || "Untitled Category",
          slug: data.slug || doc.id,
          imageUrl: data.imageUrl || FALLBACK_IMAGE,
        }
      })
      setCategories(items.slice(0, 6))
    })
    return () => unsubscribe()
  }, [])

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand/70">
            Shop by category
          </p>
          <h2 className="font-playfair text-3xl text-gray-900 md:text-4xl">
            Navigate by style to discover matching sets instantly.
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-gray-600">
            Discover jewelry by category, complete with matching sets and effortless styling notes.
          </p>
        </div>

        <div className="grid gap-5 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoryCard({ category }) {
  const { name = "Category", slug = "", imageUrl = FALLBACK_IMAGE } = category || {}

  return (
    <Link
      href={`/category/${slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-brand/10 bg-white shadow-[0_20px_45px_-28px_rgba(0,61,58,0.35)] transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={imageUrl || FALLBACK_IMAGE}
          alt={name}
          fill
          sizes="(min-width: 1280px) 180px, (min-width: 768px) 25vw, 45vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-4 text-white">
          <h3 className="text-sm font-semibold leading-tight sm:text-base">{name}</h3>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand transition group-hover:bg-brand group-hover:text-white">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}


