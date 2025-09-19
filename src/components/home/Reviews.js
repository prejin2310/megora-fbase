"use client"

import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import { EyeIcon } from "@heroicons/react/24/outline"
import ReviewModal from "@/components/home/ReviewModal"

const REVIEWS = [
  {
    name: "Ananya",
    text: "Lovely craftsmanship and safe for daily wear. Perfect for gifting too.",
    orderId: "OR-20250911-0001",
    date: "2025-09-12",
    images: ["/product1.jpg", "/product3.jpg"],
  },
  {
    name: "Neha",
    text: "Bridal combo looked premium in real life. Highly recommended for weddings.",
    orderId: "OR-20250910-0007",
    date: "2025-09-11",
    images: [],
  },
  {
    name: "Aisha",
    text: "Fast delivery and great packaging. AD stone set sparkles beautifully. The details on the jewelry are outstanding, and the packaging felt very premium.",
    orderId: "OR-20250909-0003",
    date: "2025-09-10",
    images: ["/product1.jpg", "/product3.jpg"],
  },
  {
    name: "Meera",
    text: "FLoved the finishing and shine. Truly premium for the price.",
    orderId: "OR-20250907-0005",
    date: "2025-09-08",
    images: ["/product1.jpg", "/product3.jpg"],
  },
]

function ReviewCard({ review, onOpen }) {
  return (
    <div className="relative flex h-full flex-col justify-between rounded-xl bg-white shadow-lg border border-brand/10 p-6 hover:shadow-xl transition">
      {/* Decorative Quote Mark */}
      <div className="absolute top-4 left-4 text-5xl text-brand/10 pointer-events-none select-none">
        <span className="font-serif">“</span>
      </div>

      {/* Review text (clamped) */}
      <p className="mt-10 text-sm text-gray-700 leading-relaxed line-clamp-2">
        {review.text}
      </p>

      {/* Footer with reviewer + icon hint */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center font-semibold text-brand">
            {review.name[0]}
          </div>
          <div>
            <p className="font-medium text-brand">{review.name}</p>
            <p className="text-xs text-gray-500">Verified Buyer</p>
          </div>
        </div>
        {/* Quick view icon */}
        <button
          onClick={onOpen}
          className="p-2 rounded-full bg-brand/5 hover:bg-brand/10 transition"
          title="View full review"
        >
          <EyeIcon className="w-5 h-5 text-brand" />
        </button>
      </div>
    </div>
  )
}

export default function Reviews() {
  const [selected, setSelected] = useState(null)

  return (
    <section className="bg-brand-light py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <h2 className="mb-10 text-center font-playfair text-3xl font-bold text-brand">
          What Our Customers Say
        </h2>

        {/* Swiper slider */}
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1.1}
          breakpoints={{
            640: { slidesPerView: 1.3 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{
            delay: 0, // ✅ continuous flow
            disableOnInteraction: false,
          }}
          speed={4000} // ✅ slow smooth scroll
          loop={true}
          freeMode={true} // ✅ free drag like touch
          grabCursor={true} // ✅ hand cursor on desktop
          pagination={{
            clickable: true,
            el: ".review-pagination",
          }}
          className="pb-14"
        >
          {REVIEWS.map((r, i) => (
            <SwiperSlide key={i} className="h-auto">
              <ReviewCard review={r} onOpen={() => setSelected(r)} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination bullets */}
        <div className="review-pagination flex justify-center mt-4"></div>

        {/* View all link */}
        <div className="mt-8 text-center">
          <a
            href="/reviews"
            className="inline-block rounded-full border border-brand px-6 py-2 text-sm font-medium text-brand hover:bg-brand hover:text-white transition"
          >
            View All Reviews →
          </a>
        </div>

        {/* Modal for full review */}
        {selected && (
          <ReviewModal review={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </section>
  )
}
