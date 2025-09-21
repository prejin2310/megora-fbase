"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Autoplay, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/pagination"

import ReviewModal from "@/components/home/ReviewModal"

const COMMUNITY_REVIEWS = [
  {
    name: "Ananya",
    city: "Bengaluru",
    orderId: "Order #MEG-2019",
    channel: "WhatsApp DM",
    date: "12 Jul 2025",
    message:
      "The kundan choker stayed pristine through my sangeet. Even my stylist asked where it was from after seeing the glow under lights!",
    images: ["/product1.jpg", "/product3.jpg"],
  },
  {
    name: "Ishita",
    city: "Hyderabad",
    orderId: "Order #MEG-2095",
    channel: "Instagram DM",
    date: "03 Jun 2025",
    message:
      "Global search helped me locate the exact SKU from your story. Arrived exactly like the photos and the plating feels luxe.",
    images: ["/product2.jpg"],
  },
  {
    name: "Ritika",
    city: "Delhi",
    orderId: "Order #MEG-2140",
    channel: "Post-purchase survey",
    date: "22 May 2025",
    message:
      "Wishlist alerts saved me during the restock! Limited-hour deal shipped in 48 hours with beautiful packaging.",
    images: ["/product3.jpg", "/product4.jpg"],
  },
  {
    name: "Sana",
    city: "Kochi",
    orderId: "Order #MEG-2192",
    channel: "WhatsApp DM",
    date: "28 Apr 2025",
    message:
      "Layered the tennis chains for my reception and received so many compliments. Thank you for the styling tips over chat!",
    images: ["/product2.jpg"],
  },
]

const sliderBreakpoints = {
  0: { slidesPerView: 1.05, spaceBetween: 14 },
  768: { slidesPerView: 2.2, spaceBetween: 18 },
  1024: { slidesPerView: 3.2, spaceBetween: 22 },
  1440: { slidesPerView: 3.8, spaceBetween: 24 },
}

export default function Reviews() {
  const [selectedReview, setSelectedReview] = useState(null)

  const autoplayConfig = useMemo(
    () => ({ delay: 4500, disableOnInteraction: false }),
    []
  )

  return (
    <section className="bg-gradient-to-br from-white via-brand-light to-white py-16">
      <div className="mx-auto max-w-7xl space-y-10 px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3 md:max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand/70">
              Community voices
            </p>
            <h2 className="font-playfair text-3xl text-brand md:text-4xl">
              What Our Customers Say.
            </h2>
            <p className="text-sm text-gray-600">
             Sharing valuable feedback from our happy customers on WhatsApp and Instagram. Tap any card to read the full review and view gallery shots.
            </p>
          </div>
          <Link
            href="/reviews"
            className="inline-flex w-max items-center justify-center rounded-full border border-brand/30 px-6 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
          >
            View all stories
          </Link>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={autoplayConfig}
          breakpoints={sliderBreakpoints}
          pagination={{ clickable: true, bulletClass: "swiper-pagination-bullet", bulletActiveClass: "swiper-pagination-bullet-active" }}
          className="pb-12"
          loop
        >
          {COMMUNITY_REVIEWS.map((review) => (
            <SwiperSlide key={review.orderId} className="!h-auto">
              <button
                type="button"
                onClick={() => setSelectedReview(review)}
                className="flex h-full w-full flex-col justify-between gap-4 rounded-3xl border border-brand/10 bg-white p-6 text-left shadow-[0_24px_45px_-35px_rgba(0,61,58,0.4)] transition-transform hover:-translate-y-1"
              >
                <p className="line-clamp-5 text-sm leading-relaxed text-gray-700">{review.message}</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-semibold text-brand">
                    {review.name}
                    {review.city ? `, ${review.city}` : ""}
                  </p>
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-400">{review.orderId}</p>
                  <p className="text-xs text-gray-400">{review.channel} • {review.date}</p>
                </div>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {selectedReview && (
        <ReviewModal review={selectedReview} onClose={() => setSelectedReview(null)} />
      )}
    </section>
  )
}
