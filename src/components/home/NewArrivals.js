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
      const items = await getNewArrivals(6) // ✅ fetch 6
      setProducts(items || [])
    }
    fetchProducts()
  }, [])

  return (
    <section className="bg-brand py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-white">
            New Arrivals
          </h2>
          <Link
            href="/products?filter=new"
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
            spaceBetween={24}
            slidesPerView={2} // ✅ 2 on mobile
            breakpoints={{
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
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
