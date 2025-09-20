"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { getStoreSettings } from "@/lib/db"

export default function HeroBanner() {
  const [banner, setBanner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBanner() {
      try {
        const settings = await getStoreSettings()
        setBanner(settings)
      } catch (err) {
        console.error("Error fetching banner:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchBanner()
  }, [])

  return (
    <section className="relative h-screen w-full">
      {/* Fixed Background Image */}
      <div className="fixed inset-0 -z-10">
        {loading ? (
          <div className="h-full w-full animate-pulse bg-gray-200" />
        ) : (
          <Image
            src={banner?.bannerImage || "/demo/hero-fallback.jpg"}
            alt="Megora Jewels Hero"
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Hero Content */}
      <div className="relative flex h-full items-center justify-center text-center px-6">
        <div className="max-w-3xl space-y-6 animate-fade-up">
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-md leading-tight">
            {banner?.bannerText || "Handcrafted Elegance, Timeless Beauty"}
          </h1>
          <p className="mx-auto max-w-xl text-base sm:text-lg lg:text-xl text-white/90">
            {banner?.bannerDescription ||
              "Discover Anti Tarnish daily wear, exquisite necklaces, AD stone sets, harams, and bridal combos curated for every occasion."}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center rounded-full border-2 border-white px-7 py-3 text-base font-semibold text-white transition hover:bg-white hover:text-brand"
            >
              Shop Now →
            </Link>
            <Link
              href="/category/bridal-combo"
              className="inline-flex items-center rounded-full border-2 border-white px-7 py-3 text-base font-semibold text-white transition hover:bg-white hover:text-brand"
            >
              Explore Bridal
            </Link>
          </div>
        </div>
      </div>

      {/* Gradient at bottom for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
