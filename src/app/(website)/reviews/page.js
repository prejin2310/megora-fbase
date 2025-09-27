"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import ReviewModal from "@/components/home/ReviewModal"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

function ReviewCard({ review, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left rounded-xl p-4 sm:p-6 hover:shadow-lg transition flex flex-col justify-between gap-4 ${review.channel === 'instagram' ? 'bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 shadow-[0_18px_40px_-28px_rgba(249,115,22,0.12)]' : 'bg-white border border-brand/10 shadow-[0_18px_40px_-28px_rgba(0,61,58,0.08)]'}`}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center font-semibold text-brand">{(review.name || "?")[0]}</div>
        <div className="flex-1">
          <p className="font-medium text-brand">{review.name}</p>
          <p className="text-xs text-gray-500">Verified Buyer • {review.city || '—'}</p>
        </div>
      </div>

      <p className="mt-2 text-sm text-gray-700 line-clamp-3">{review.message || review.text}</p>

      {/* thumbnails */}
      {review.images?.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.images.slice(0, 3).map((im, idx) => {
            const src = typeof im === 'string' ? im : (im?.url || im)
            return (
              <div key={idx} className="h-14 w-14 rounded-md overflow-hidden border bg-gray-50">
                <img src={src} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <div className="uppercase tracking-widest text-xs text-gray-400">{review.orderId || '—'}</div>
        <div className="text-xs text-gray-400">{review.channel === 'instagram' ? 'Instagram' : 'WhatsApp'} {'\u2022'} {review.date ? new Date(review.date).toLocaleDateString() : ''}</div>
      </div>
    </button>
  )
}

export default function ReviewsPage() {
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const [reviews, setReviews] = useState([])
  const perPage = 6

  useEffect(() => {
    (async () => {
      try {
        const snaps = await getDocs(query(collection(db, "community_reviews"), orderBy("createdAt", "desc")))
        setReviews(snaps.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error("Failed to load community reviews", err)
      }
    })()
  }, [])

  const start = (page - 1) * perPage
  const paginated = reviews.slice(start, start + perPage)
  const totalPages = Math.ceil(reviews.length / perPage)

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
