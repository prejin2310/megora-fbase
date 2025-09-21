"use client"

import { useState } from "react"
import Image from "next/image"
import ReviewModal from "@/components/home/ReviewModal"

// Demo reviews
const REVIEWS = [
  {
    name: "Ananya",
    text: "Lovely craftsmanship and safe for daily wear. Perfect for gifting too.",
    orderId: "OR-20250911-0001",
    date: "2025-09-12",
    images: ["/demo/review1.jpg"],
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
    images: ["/demo/review2.jpg", "/demo/review3.jpg"],
  },
  {
    name: "Riya",
    text: "Necklace quality was superb. Exactly like the pictures shown.",
    orderId: "OR-20250908-0002",
    date: "2025-09-09",
    images: [],
  },
  {
    name: "Meera",
    text: "Loved the finishing and shine. Truly premium for the price.",
    orderId: "OR-20250907-0005",
    date: "2025-09-08",
    images: ["/demo/review4.jpg"],
  },
  {
    name: "Sneha",
    text: "Customer support was very helpful in customizing my order. Delivery on time.",
    orderId: "OR-20250905-0009",
    date: "2025-09-06",
    images: [],
  },
]

function ReviewCard({ review, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full text-left rounded-xl bg-white shadow-md border border-brand/10 p-6 hover:shadow-lg transition"
    >
      <span className="absolute -top-4 left-6 text-6xl font-serif text-brand/10 select-none">
        &ldquo;
      </span>

      <p className="mt-4 text-sm text-gray-700 line-clamp-2">{review.text}</p>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center font-semibold text-brand">
          {review.name[0]}
        </div>
        <div>
          <p className="font-medium text-brand">{review.name}</p>
          <p className="text-xs text-gray-500">Verified Buyer</p>
        </div>
      </div>
    </button>
  )
}

export default function ReviewsPage() {
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const perPage = 6

  const start = (page - 1) * perPage
  const paginated = REVIEWS.slice(start, start + perPage)
  const totalPages = Math.ceil(REVIEWS.length / perPage)

  return (
    <section className="bg-brand-light min-h-screen">
      <div className="relative h-[40vh] min-h-[250px] w-full">
        <Image
          src="/reviewBanner.webp"
          alt="Customer Reviews"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full items-center justify-center text-center">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white">
            Customer Reviews
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((r, i) => (
            <ReviewCard key={r.orderId ?? i} review={r} onClick={() => setSelected(r)} />
          ))}
        </div>

        <div className="mt-10 flex justify-center gap-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                page === i + 1
                  ? "bg-brand text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <ReviewModal review={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  )
}
