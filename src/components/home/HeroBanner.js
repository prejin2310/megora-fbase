"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBagIcon, SparklesIcon } from "@heroicons/react/24/outline"

export default function HeroBanner() {
  return (
    <section className="relative h-[85vh] md:h-screen w-full overflow-hidden">
      {/* Background Image with fixed scroll + zoom animation */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 20, ease: "easeOut" }}
          className="absolute inset-0 !fixed"
        >
          <Image
            src="/loginBanner.png" // 🔥 replace with your banner image
            alt="Megora Jewels Hero"
            fill
            priority
            className="object-cover object-center"
          />
        </motion.div>

        {/* Premium Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-cream/20" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      </div>

      {/* Content at bottom-left */}
      <div className="relative flex h-full items-end justify-start px-6 md:px-16 pb-12 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-xl space-y-4 text-left"
        >
          {/* Title */}
          <h1 className="font-playfair text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-snug drop-shadow-lg">
            Born to Shine.<br />
            Adored by Generations.
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed">
            Crafted to reflect your elegance.  
            Our timeless designs inspire every moment.  
            <strong> Be ready for what’s next!</strong>
          </p>

          {/* Buttons */}
          <div className="pt-5 flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Shop Now
            </Link>
            <Link
              href="/category/anti-tarnish"
              className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-white px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-gray-900"
            >
              <SparklesIcon className="w-5 h-5" />
              Explore Anti Tarnish
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
