"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navigation, Autoplay } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"

import { getNewArrivals } from "@/lib/db"
import ProductCard from "@/components/product/ProductCard"

const sliderBreakpoints = {
  0: { slidesPerView: 2, spaceBetween: 12 },
  640: { slidesPerView: 3, spaceBetween: 16 },
  1024: { slidesPerView: 4, spaceBetween: 20 },
  1440: { slidesPerView: 5, spaceBetween: 24 },
}

export default function DiwaliSaleSection() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const swiperRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const items = await getNewArrivals(12)
        if (mounted) setProducts(items || [])
      } catch (error) {
        console.error("diwali-sale", error)
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
      {/* Floating festive icons */}
      <FestiveIcons />

      <div className="relative mx-auto max-w-7xl space-y-10 px-4">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4 md:max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
            Diwali Sale
            </p>
            <h2 className="font-playfair text-3xl leading-tight text-amber-100 md:text-4xl">
              Sparkling Deals for a Bright Diwali             </h2>
            <p className="text-sm text-white/75">
              Handpicked jewels with festive discounts. Limited time only.
            </p>
          </div>
          <Link
            href="/product"
            className="inline-flex w-max items-center justify-center rounded-full border border-amber-400/50 px-6 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/20"
          >
            Explore All Deals
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
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop
            breakpoints={sliderBreakpoints}
            className="diwali-sale-swiper pb-10"
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
            No festive items right now. Check back soon for Diwali specials.
          </div>
        )}
      </div>

      {/* CSS Animations inline */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(6deg); }
        }
        .animate-swing {
          transform-origin: top center;
          animation: swing 3.5s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle 2.5s ease-in-out infinite;
        }

        .diwali-sale-swiper .swiper-button-next,
        .diwali-sale-swiper .swiper-button-prev {
          height: 42px;
          width: 42px;
          border-radius: 9999px;
          background: rgba(255, 193, 7, 0.25);
          color: #fff;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .diwali-sale-swiper .swiper-button-next:hover,
        .diwali-sale-swiper .swiper-button-prev:hover {
          transform: translateY(-2px);
          background: rgba(255, 193, 7, 0.4);
        }
      `}</style>
    </section>
  )
}

/* Festive Icons using diya.png & lantern.png */
function FestiveIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Diyas floating */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`diya-${i}`}
          className="absolute animate-float"
          style={{
            top: `${25 + i * 20}%`,
            left: `${10 + i * 30}%`,
            animationDelay: `${i * 1.2}s`,
          }}
        >
          <Image
            src="/diya.png"
            alt="Diya"
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10"
          />
        </div>
      ))}

      {/* Lanterns swinging */}
      {[...Array(2)].map((_, i) => (
        <div
          key={`lantern-${i}`}
          className="absolute animate-swing"
          style={{
            top: `${5 + i * 40}%`,
            right: `${10 + i * 20}%`,
            animationDelay: `${i * 1.5}s`,
          }}
        >
          <Image
            src="/lantern.png"
            alt="Lantern"
            width={48}
            height={48}
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
        </div>
      ))}

      {/* Sparkles / twinkles */}
      {[...Array(10)].map((_, i) => (
        <span
          key={`sparkle-${i}`}
          className="absolute h-1 w-1 rounded-full bg-yellow-200 animate-twinkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-amber-200/20 bg-white/5 shadow-md">
      {/* Image skeleton with proper aspect ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <div className="h-full w-full animate-pulse rounded-t-xl bg-amber-100/30" />
        
        {/* Icon skeletons in top-right */}
        <div className="absolute right-2 top-2 flex flex-col gap-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/40" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/40" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Title skeleton */}
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-amber-200/40" />
        
        {/* Price + Colors skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-amber-200/40" />
            <div className="h-3 w-12 animate-pulse rounded-full bg-amber-200/30" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 animate-pulse rounded-full bg-amber-200/30" />
            <div className="h-4 w-4 animate-pulse rounded-full bg-amber-200/30" />
          </div>
        </div>
        
        {/* Button skeletons */}
        <div className="mt-auto flex flex-col gap-2">
          <div className="h-8 w-full animate-pulse rounded-full bg-amber-200/30" />
          <div className="h-8 w-full animate-pulse rounded-full bg-amber-200/20" />
        </div>
      </div>
    </div>
  )
}
