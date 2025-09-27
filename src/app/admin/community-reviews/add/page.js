"use client"

import ReviewForm from "@/components/admin/ReviewForm"
import { useRouter } from "next/navigation"

export default function AdminCommunityReviewsAdd() {
  const router = useRouter()

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-4">Add Community Review</h1>
      <div className="max-w-3xl bg-white border rounded p-4">
        <ReviewForm onSaved={(id) => router.push(`/admin/community-reviews/${id}`)} />
      </div>
    </div>
  )
}
