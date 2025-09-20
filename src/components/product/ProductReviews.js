"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"

function Star({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${
        filled ? "fill-yellow-400" : "fill-none"
      } stroke-yellow-500`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M11.48 3.5a.75.75 0 011.04 0l2.2 2.21a.75.75 0 00.42.21l3.08.45a.75.75 0 01.42 1.28l-2.23 2.18a.75.75 0 00-.22.66l.52 3.05a.75.75 0 01-1.08.79l-2.74-1.44a.75.75 0 00-.7 0l-2.74 1.44a.75.75 0 01-1.08-.79l.52-3.05a.75.75 0 00-.22-.66L5.36 7.65a.75.75 0 01.42-1.28l3.08-.45a.75.75 0 00.42-.21l2.2-2.21z"
      />
    </svg>
  )
}

function Stars({ value = 0 }) {
  const rounded = Math.round(value)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} filled={i <= rounded} />
      ))}
    </div>
  )
}

export default function ProductReviews({ product }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return
      try {
        const rQ = query(
          collection(db, "products", product.id, "reviews"),
          orderBy("createdAt", "desc")
        )
        const rSnap = await getDocs(rQ)
        setReviews(rSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [product?.id])

  const ratingAvg =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
            reviews.length) *
            10
        ) / 10
      : 0

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please log in to review")
      return
    }
    if (!reviewForm.comment.trim()) {
      toast.error("Please write a comment")
      return
    }

    try {
      setSubmitting(true)
      await addDoc(collection(db, "products", product.id, "reviews"), {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
        createdAt: new Date(),
      })
      toast.success("Thanks for your review!")
      setReviewForm({ rating: 5, comment: "" })

      // reload reviews
      const rQ = query(
        collection(db, "products", product.id, "reviews"),
        orderBy("createdAt", "desc")
      )
      const rSnap = await getDocs(rQ)
      setReviews(rSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
      toast.error("Could not submit review")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-sm text-neutral-600">Customer Reviews</div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-semibold">{ratingAvg || 0}</span>
            <Stars value={ratingAvg} />
            <span className="text-sm text-neutral-600">
              ({reviews.length} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Review form */}
      <form
        onSubmit={submitReview}
        className="mb-6 rounded-xl border p-4 bg-neutral-50"
      >
        <div className="mb-2 text-sm font-medium">Write a review</div>
        <div className="flex items-center gap-3">
          <label className="text-sm">Rating</label>
          <select
            className="rounded-md border border-neutral-300 p-2"
            value={reviewForm.rating}
            onChange={(e) =>
              setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))
            }
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Star{r > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className="mt-3 w-full rounded-md border border-neutral-300 p-3 outline-none focus:border-[#003D3A]"
          rows={3}
          placeholder="Share your experience..."
          value={reviewForm.comment}
          onChange={(e) =>
            setReviewForm((f) => ({ ...f, comment: e.target.value }))
          }
        />
        <div className="mt-3">
          <button
            disabled={submitting}
            className="rounded-lg bg-[#003D3A] px-4 py-2 text-white disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>

      {/* Review list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-neutral-600">Loading reviews…</div>
        ) : reviews.length > 0 ? (
          reviews.map((r) => (
            <div key={r.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{r.userName || "User"}</div>
                <Stars value={r.rating} />
              </div>
              <div className="mt-2 text-[15px] text-neutral-700">
                {r.comment}
              </div>
              {r.createdAt?.toDate && (
                <div className="mt-2 text-xs text-neutral-500">
                  {r.createdAt.toDate().toLocaleDateString()}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-sm text-neutral-600">No reviews yet.</div>
        )}
      </div>
    </div>
  )
}
