"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { getStoreSettings } from "@/lib/db"

export default function HeroBanner() {
  const [banner, setBanner] = useState(null)

  useEffect(() => {
    async function fetchBanner() {
      try {
        const settings = await getStoreSettings()
        setBanner(settings)
      } catch (err) {
        console.error("Error fetching banner:", err)
      }
    }
    fetchBanner()
  }, [])

  if (!banner) {
    return (
      <section className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading banner...</p>
      </section>
    )
  }

  return (
    <section className="relative w-full">
      <div className="relative w-full overflow-hidden">
        {/* Fullscreen Hero */}
        <div className="relative h-[100vh] min-h-[500px] w-full sm:h-[90vh] lg:h-[90vh]">
          <Image
            src={banner.bannerImage}
            alt="Megora Jewels Hero"
            fill
            priority
            className="object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="relative z-10 flex h-full items-center justify-center text-center px-4">
            <div className="max-w-2xl space-y-5">
              <h1 className="font-playfair text-4xl font-bold text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
                {banner.bannerText || "Handcrafted Elegance, Timeless Beauty"}
              </h1>
              <p className="mx-auto max-w-lg text-base text-white/90 sm:text-lg lg:text-xl">
                Discover Anti Tarnish daily wear, exquisite necklaces, AD stone sets,
                harams, and bridal combos curated for every occasion.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="inline-flex items-center rounded-full border-2 border-white px-7 py-3 text-base font-semibold text-white transition hover:bg-white hover:text-brand-green"
                >
                  Shop Now →
                </Link>
                <Link
                  href="/category/bridal-combo"
                  className="inline-flex items-center rounded-full border-2 border-white px-7 py-3 text-base font-semibold text-white transition hover:bg-white hover:text-brand-green"
                >
                  Explore Bridal
                </Link>
              </div>
            </div>
          </div>

          {/* Gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>
    </section>
  )
}
