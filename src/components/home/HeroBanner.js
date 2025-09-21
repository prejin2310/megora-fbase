"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBagIcon, SparklesIcon } from "@heroicons/react/24/outline"

export default function HeroBanner() {
  return (
    <section className="relative min-h-[760px] w-full overflow-hidden bg-brand-light">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/loginBanner.png"
          alt="Megora Jewels hero"
          fill
          priority
          className="hero-banner-image object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/35 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[760px] max-w-7xl flex-col justify-end gap-10 px-4 pb-16 pt-24 text-white md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]">
            Megora Atelier
          </div>
          <div className="space-y-4">
            <h1 className="font-playfair text-4xl leading-tight sm:text-5xl md:text-[52px]">
              Heirloom-worthy jewels for every moment.
            </h1>
            <p className="text-sm text-white/85 sm:text-base">
              Discover anti-tarnish silhouettes, handset stones, and concierge-level styling. Each limited drop is photographed in natural light so you receive exactly what you fall in love with online.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:bg-brand-light/90"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              Shop the collection
            </Link>
            <Link
              href="/category/necklaces"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <SparklesIcon className="h-5 w-5" />
              Explore necklaces
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.08);
          }
        }

        .hero-banner-image {
          animation: heroZoom 18s ease-in-out infinite alternate;
        }
      `}</style>
    </section>
  )
}

