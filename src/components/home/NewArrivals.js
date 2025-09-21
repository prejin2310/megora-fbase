"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navigation } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"

import { getNewArrivals } from "@/lib/db"
import ProductCard from "@/components/product/ProductCard"

const sliderBreakpoints = {
  0: { slidesPerView: 1.2, spaceBetween: 14 },
  640: { slidesPerView: 2.1, spaceBetween: 18 },
  1024: { slidesPerView: 3.3, spaceBetween: 22 },
  1280: { slidesPerView: 4.2, spaceBetween: 24 },
  1536: { slidesPerView: 5, spaceBetween: 26 },
}

export default function NewArrivals() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const items = await getNewArrivals(12)
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
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light via-white to-white py-16">
        <div className="mx-auto max-w-7xl space-y-10 px-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3 md:max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand/70">
                New arrivals
              </p>
              <h2 className="font-playfair text-3xl text-brand md:text-4xl">
                Fresh from the atelier: limited pieces ready to ship.
              </h2>
              <p className="text-sm text-gray-600">
                Glide through this week&apos;s drops. Tap quick view to inspect hallmarks, variant notes, and plating details without leaving the carousel.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex w-max items-center justify-center rounded-full border border-brand/30 px-6 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
            >
              View full catalogue
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <ProductPlaceholder key={index} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <Swiper
              modules={[Navigation]}
              navigation
              breakpoints={sliderBreakpoints}
              className="new-arrivals-swiper pb-6"
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
            <div className="rounded-3xl border border-dashed border-brand/20 bg-brand-light/70 p-10 text-center text-gray-500">
              No new arrivals right now. Check back soon for fresh drops.
            </div>
          )}
        </div>
      </section>

      <style jsx global>{`
        .new-arrivals-swiper .swiper-button-next,
        .new-arrivals-swiper .swiper-button-prev {
          height: 40px;
          width: 40px;
          border-radius: 9999px;
          background: rgba(0, 61, 58, 0.85);
          color: #fff;
          transition: transform 0.2s ease;
        }

        .new-arrivals-swiper .swiper-button-next:hover,
        .new-arrivals-swiper .swiper-button-prev:hover {
          transform: translateY(-2px);
        }

        .new-arrivals-swiper .swiper-button-next::after,
        .new-arrivals-swiper .swiper-button-prev::after {
          font-size: 16px;
          font-weight: 700;
        }

        .new-arrivals-swiper .swiper-button-disabled {
          opacity: 0.35 !important;
        }
      `}</style>
    </>
  )
}

function ProductPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center border border-brand/10 bg-white p-6">
      <div className="h-56 w-full bg-brand/10" />
      <div className="mt-4 h-4 w-3/4 bg-brand/10" />
      <div className="mt-2 h-4 w-1/2 bg-brand/10" />
      <div className="mt-5 h-10 w-full bg-brand/10" />
    </div>
  )
}
