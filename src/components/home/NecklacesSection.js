"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navigation } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"

import { getNewArrivals, getProductsByCategory } from "@/lib/db"
import ProductCard from "@/components/product/ProductCard"

const CATEGORY_KEY = "necklaces"

const sliderBreakpoints = {
  0: { slidesPerView: 2, spaceBetween: 12 },   // ✅ 2 cards per row on mobile
  640: { slidesPerView: 3, spaceBetween: 16 },
  1024: { slidesPerView: 4, spaceBetween: 20 },
  1440: { slidesPerView: 5, spaceBetween: 24 },
}

export default function NecklacesSection() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const items = await getProductsByCategory(CATEGORY_KEY, 16)
        if (mounted) {
          if (Array.isArray(items) && items.length > 0) {
            setProducts(items)
          } else {
            const fallback = await getNewArrivals(16)
            setProducts(fallback || [])
          }
        }
      } catch (error) {
        console.error("necklaces", error)
        if (mounted) {
          const fallback = await getNewArrivals(16)
          setProducts(fallback || [])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF6EB] via-[#FFEEDC] to-[#FFF9F1] py-16">
      {/* Decorative blur */}
      <div className="pointer-events-none absolute -right-32 top-16 h-72 w-72 rounded-full bg-[#F7D2B4]/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-10 px-4">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4 md:max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand/70">
              Signature Necklaces
            </p>
            <h2 className="font-playfair text-3xl text-brand md:text-4xl">
              One edit. Many moods. Always elegant.
            </h2>
            <p className="text-sm text-gray-600">
              From bold chokers to simple chains, explore pieces perfect for layering or wearing solo.
            </p>
          </div>
          <Link
            href={`/category/${CATEGORY_KEY}`}
            className="inline-flex w-max items-center justify-center rounded-full border border-brand/20 px-6 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
          >
            Browse All 
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5 xl:gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <Swiper
            modules={[Navigation]}
            navigation
            breakpoints={sliderBreakpoints}
            className="necklaces-swiper pb-10"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} className="!h-auto">
                <div className="flex h-full justify-center">
                  <ProductCard product={product} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="rounded-3xl border border-brand/10 bg-white/70 p-10 text-center text-brand/70">
            Necklaces are being restocked right now. Add favourites to wishlist to be notified first.
          </div>
        )}
      </div>

      {/* Swiper button styles */}
      <style jsx global>{`
        .necklaces-swiper .swiper-button-next,
        .necklaces-swiper .swiper-button-prev {
          height: 42px;
          width: 42px;
          border-radius: 9999px;
          background: rgba(80, 60, 40, 0.18);
          color: #2c3432;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .necklaces-swiper .swiper-button-next:hover,
        .necklaces-swiper .swiper-button-prev:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.65);
        }

        .necklaces-swiper .swiper-button-disabled {
          opacity: 0.35 !important;
        }
      `}</style>
    </section>
  )
}

//
// ✅ Inline skeleton that matches ProductCard
//
function ProductSkeleton() {
  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-brand/10 bg-white shadow-md">
      {/* Image skeleton with proper aspect ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <div className="h-full w-full animate-pulse rounded-t-xl bg-brand/15" />
        
        {/* Icon skeletons in top-right */}
        <div className="absolute right-2 top-2 flex flex-col gap-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/60 shadow-md" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/60 shadow-md" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Title skeleton */}
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-brand/20" />
        
        {/* Price + Colors skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-brand/25" />
            <div className="h-3 w-12 animate-pulse rounded-full bg-brand/15" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 animate-pulse rounded-full bg-brand/20" />
            <div className="h-4 w-4 animate-pulse rounded-full bg-brand/20" />
          </div>
        </div>
        
        {/* Button skeletons */}
        <div className="mt-auto flex flex-col gap-2">
          <div className="h-8 w-full animate-pulse rounded-full bg-brand/20" />
          <div className="h-8 w-full animate-pulse rounded-full bg-brand/15" />
        </div>
      </div>
    </div>
  )
}
