"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, limit, startAfter, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ref as sRef, deleteObject } from "firebase/storage"
import { storage } from "@/lib/firebase"
import Link from "next/link"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

const PAGE_SIZE = 10

function ChannelBadge({ channel }) {
  if (!channel) return null
  if (channel.toLowerCase().includes('insta') || channel === 'instagram') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 px-3 py-1 text-xs font-semibold text-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3.2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" /><path d="M17.5 6.5h.01" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Instagram
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 7.5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 12h10" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      WhatsApp
    </span>
  )
}

export default function AdminCommunityReviewsList() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const snaps = await getDocs(query(collection(db, "community_reviews"), orderBy("createdAt", "desc")))
        const items = snaps.docs.map((d) => ({ id: d.id, ...d.data() }))
        setReviews(items)
        setTotal(items.length)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load reviews")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const perPage = PAGE_SIZE
  const start = (page - 1) * perPage
  const paginated = reviews.slice(start, start + perPage)
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const handleDelete = async (r) => {
    if (!confirm("Delete review permanently?")) return
    try {
      // delete images
      for (const im of r.images || []) {
        try {
          if (im?.path) await deleteObject(sRef(storage, im.path))
        } catch (e) {
          console.warn("Failed to delete image", e)
        }
      }
      await deleteDoc(doc(db, "community_reviews", r.id))
      toast.success("Deleted")
      // refresh local list
      setReviews((s) => s.filter((x) => x.id !== r.id))
      setTotal((t) => Math.max(0, t - 1))
    } catch (err) {
      console.error(err)
      toast.error("Delete failed")
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Community Reviews</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/community-reviews/add" className="inline-flex items-center px-4 py-2 bg-brand text-white rounded">Add review</Link>
        </div>
      </div>

      <div className="bg-white border rounded">
        <div className="divide-y">
          {loading && <div className="p-4 text-sm text-gray-500">Loading…</div>}
          {!loading && paginated.length === 0 && <div className="p-4 text-sm text-gray-500">No reviews</div>}

          {paginated.map((r) => (
            <div key={r.id} className="p-4 sm:p-5 flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-50 border">
                  {r.images?.[0] ? <img src={typeof r.images[0] === 'string' ? r.images[0] : (r.images[0].url || r.images[0])} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">—</div>}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="truncate">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-brand truncate">{r.name} {r.city ? `, ${r.city}` : ''}</div>
                      <ChannelBadge channel={r.channel} />
                    </div>
                    <div className="text-sm text-gray-600 truncate mt-1">{r.message || r.text}</div>
                  </div>
                  <div className="text-right text-xs text-gray-400">{r.orderId || '—'}<br />{r.date || '—'}</div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link href={`/admin/community-reviews/${r.id}`} className="px-3 py-1 text-sm bg-gray-50 border rounded">View</Link>
                  <Link href={`/admin/community-reviews/${r.id}/edit`} className="px-3 py-1 text-sm bg-white border rounded">Edit</Link>
                  <button onClick={() => handleDelete(r)} className="px-3 py-1 text-sm bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-brand text-white' : 'bg-white border'}`}>{i + 1}</button>
        ))}
      </div>
    </div>
  )
}

