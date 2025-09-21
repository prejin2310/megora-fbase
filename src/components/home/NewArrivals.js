"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Navigation, Autoplay } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"

import { getNewArrivals } from "@/lib/db"
import ProductCard from "@/components/product/ProductCard"

const sliderBreakpoints = {
  0: { slidesPerView: 1.15, spaceBetween: 14 },
  480: { slidesPerView: 2, spaceBetween: 16 },
  768: { slidesPerView: 3, spaceBetween: 20 },
  1024: { slidesPerView: 4, spaceBetween: 24 },
  1440: { slidesPerView: 5, spaceBetween: 28 },
}

export default function NewArrivals() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const swiperRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const items = await getNewArrivals(16)
        if (mounted) setProducts(items || [])
      } catch (error) {
        console.error("new-arrivals", error)
        if (mounted) setProducts([])
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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#03332D] via-[#064439] to-[#012320] py-16 text-white">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-160px] h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-10 px-4">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4 md:max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
              New arrivals
            </p>
            <h2 className="font-playfair text-3xl leading-tight md:text-4xl">
              Handpicked. Limited. Loved.
            </h2>
            <p className="text-sm text-white/75">
              Explore, preview, and add to your bag in one smooth flow.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex w-max items-center justify-center rounded-full border border-white/30 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            View All
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true, // ✅ pause when hovered
            }}
            loop
            breakpoints={sliderBreakpoints}
            className="new-arrivals-swiper pb-10"
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper
            }}
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
          <div className="rounded-3xl border border-white/15 bg-white/10 p-10 text-center text-white/80">
            No new arrivals right now. Check back soon for fresh drops.
          </div>
        )}
      </div>

      {/* Swiper button styles */}
      <style jsx global>{`
        .new-arrivals-swiper .swiper-button-next,
        .new-arrivals-swiper .swiper-button-prev {
          height: 42px;
          width: 42px;
          border-radius: 9999px;
          background: rgba(0, 0, 0, 0.25);
          color: #fff;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .new-arrivals-swiper .swiper-button-next:hover,
        .new-arrivals-swiper .swiper-button-prev:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.2);
        }

        .new-arrivals-swiper .swiper-button-disabled {
          opacity: 0.35 !important;
        }
      `}</style>
    </section>
  )
}

function ProductSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-5">
      <div className="animate-pulse rounded-2xl bg-white/15" style={{ aspectRatio: "4 / 5" }} />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/20" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/20" />
      </div>
      <div className="mt-auto flex flex-col gap-3 pt-5">
        <div className="h-10 w-full animate-pulse rounded-full bg-white/15" />
        <div className="h-10 w-full animate-pulse rounded-full bg-white/15" />
      </div>
    </div>
  )
}
