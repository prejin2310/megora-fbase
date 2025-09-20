"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"

import { getNewArrivals } from "@/lib/db"
import ProductCard from "@/components/product/ProductCard"

export default function NewArrivals() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    async function fetchProducts() {
      const items = await getNewArrivals(10)
      setProducts(items || [])
    }
    fetchProducts()
  }, [])

  return (
    <section className="bg-brand py-14 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-white">
            New Arrivals
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-white hover:underline"
          >
            View All →
          </Link>
        </div>

        {/* Slider */}
        {products.length > 0 ? (
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            slidesPerView={2}
            breakpoints={{
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 5 },
            }}
            className="z-10 relative" // ✅ prevent overlap
          >
            {products.map((product, i) => (
              <SwiperSlide key={product.id}>
                <div
                  className="aspect-square animate-fadeIn"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-center text-white">No products available</p>
        )}
      </div>
    </section>
  )
}
