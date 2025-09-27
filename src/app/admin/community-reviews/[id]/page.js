"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, deleteDoc } from "firebase/firestore"
import { ref as sRef, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useRouter, useParams } from "next/navigation"
import toast from "react-hot-toast"

export default function ReviewDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "community_reviews", id))
        if (!snap.exists()) {
          toast.error("Review not found")
          router.replace("/admin")
          return
        }
        setData({ id: snap.id, ...snap.data() })
      } catch (err) {
        console.error(err)
        toast.error("Failed to load")
        router.replace("/admin")
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const deleteAll = async () => {
    if (!confirm("Delete this review and its images?")) return
    setDeleting(true)
    try {
      // delete images from storage
      const imgs = data?.images || []
      for (const im of imgs) {
        try {
          if (im.path) {
            await deleteObject(sRef(storage, im.path))
          }
        } catch (e) {
          // ignore individual failures
          console.warn("failed to delete storage item", e)
        }
      }

      await deleteDoc(doc(db, "community_reviews", id))
      toast.success("Review deleted")
      router.push("/admin")
    } catch (err) {
      console.error(err)
      toast.error("Delete failed")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="p-6">Loading…</div>

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-start justify-between">
        <h1 className="text-xl font-semibold">Review: {data?.name}</h1>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/admin/community-reviews/${id}/edit`)} className="px-3 py-1 rounded bg-gray-200">Edit</button>
          <button onClick={deleteAll} disabled={deleting} className="px-3 py-1 rounded bg-red-600 text-white">{deleting ? 'Deleting…' : 'Delete'}</button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          <p className="text-sm text-gray-600">{data?.message}</p>
          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
            <div>
              <dt className="text-xs text-gray-500">Name</dt>
              <dd>{data?.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Location</dt>
              <dd>{data?.city || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Order</dt>
              <dd>{data?.orderId || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Channel</dt>
              <dd>{data?.channel}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Date</dt>
              <dd>{data?.date || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Created</dt>
              <dd>{data?.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toLocaleString() : data?.createdAt || '—'}</dd>
            </div>
          </dl>
        </div>

        <aside className="space-y-3">
          <h3 className="text-sm font-medium">Images</h3>
          <div className="grid grid-cols-2 gap-3">
            {(data?.images || []).map((im, i) => (
              <div key={i} className="relative h-28 rounded overflow-hidden border">
                <img src={im.url} alt={`img-${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
            {!data?.images?.length && <div className="text-sm text-gray-500">No images</div>}
          </div>
        </aside>
      </div>
    </div>
  )
}
