"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db, storage } from "@/lib/firebase"
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import toast from "react-hot-toast"

// image compression helper (same as create form)
async function compressToWebp(file, maxSize = 500 * 1024) {
  if (!file.type.startsWith("image/")) return file
  const img = await createImageBitmap(file)
  const canvas = new OffscreenCanvas(img.width, img.height)
  const ctx = canvas.getContext("2d")
  ctx.drawImage(img, 0, 0)

  let quality = 0.92
  let blob = await canvas.convertToBlob({ type: "image/webp", quality })
  while (blob.size > maxSize && quality > 0.2) {
    quality -= 0.12
    blob = await canvas.convertToBlob({ type: "image/webp", quality })
  }
  let width = img.width
  let height = img.height
  while (blob.size > maxSize && Math.max(width, height) > 400) {
    width = Math.round(width * 0.8)
    height = Math.round(height * 0.8)
    const tmp = new OffscreenCanvas(width, height)
    const tctx = tmp.getContext("2d")
    tctx.drawImage(img, 0, 0, width, height)
    blob = await tmp.convertToBlob({ type: "image/webp", quality })
  }
  return new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), { type: "image/webp" })
}

export default function EditReviewPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [orderId, setOrderId] = useState("")
  const [channel, setChannel] = useState("whatsapp")
  const [date, setDate] = useState("")
  const [message, setMessage] = useState("")
  const [images, setImages] = useState([])

  useEffect(() => {
    (async () => {
      if (!id) return
      setLoading(true)
      try {
        const snap = await getDoc(doc(db, "community_reviews", id))
        if (!snap.exists()) {
          toast.error("Review not found")
          router.replace("/admin/community-reviews")
          return
        }
        const data = snap.data()
        setName(data.name || "")
        setCity(data.city || "")
        setOrderId(data.orderId || "")
        setChannel(data.channel || "whatsapp")
        setDate(data.date || "")
        setMessage(data.message || data.text || "")
        setImages(data.images || [])
      } catch (err) {
        console.error(err)
        toast.error("Failed to load")
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const onFiles = async (files) => {
    if (!files?.length) return
    const list = Array.from(files)
    const uploading = toast.loading("Uploading images...")
    try {
      const uploaded = []
      for (const f of list) {
        const toUpload = f.size > 500 * 1024 ? await compressToWebp(f) : f
        const path = `community_reviews/${Date.now()}_${toUpload.name}`
        const r = sRef(storage, path)
        await uploadBytes(r, toUpload)
        const url = await getDownloadURL(r)
        uploaded.push({ url, path })
      }
      setImages((p) => [...p, ...uploaded])
      toast.success("Uploaded images")
    } catch (err) {
      console.error(err)
      toast.error("Image upload failed")
    } finally {
      toast.dismiss(uploading)
    }
  }

  const onRemoveImage = async (idx) => {
    if (!confirm("Remove this image? This will delete it from storage.")) return
    const im = images[idx]
    try {
      if (im?.path) await deleteObject(sRef(storage, im.path))
    } catch (err) {
      console.warn("Failed to delete storage image", err)
      toast.warning("Failed to delete storage image, but will remove from record")
    }
    setImages((p) => p.filter((_, i) => i !== idx))
  }

  const onSave = async (e) => {
    e.preventDefault()
    if (!name || !message) {
      toast.error("Name and message are required")
      return
    }
    setSaving(true)
    try {
      await updateDoc(doc(db, "community_reviews", id), {
        name,
        city,
        orderId,
        channel,
        date: date || null,
        message,
        images,
        updatedAt: serverTimestamp(),
      })
      toast.success("Updated")
      router.push(`/admin/community-reviews/${id}`)
    } catch (err) {
      console.error(err)
      toast.error("Update failed")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading…</div>

  return (
    <form onSubmit={onSave} className="p-4 md:p-6 space-y-4 bg-white rounded">
      <h2 className="text-lg font-semibold">Edit Review</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label>
          <span className="text-sm">Name</span>
          <input className="mt-1 w-full rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          <span className="text-sm">Delivery location (city)</span>
          <input className="mt-1 w-full rounded border px-3 py-2" value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label>
          <span className="text-sm">Order number</span>
          <input className="mt-1 w-full rounded border px-3 py-2" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        </label>
        <label>
          <span className="text-sm">Channel</span>
          <select className="mt-1 w-full rounded border px-3 py-2" value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
          </select>
        </label>
        <label>
          <span className="text-sm">Order date</span>
          <input type="date" className="mt-1 w-full rounded border px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <label>
        <span className="text-sm">Message</span>
        <textarea className="mt-1 w-full rounded border px-3 py-2 min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} required />
      </label>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Images (optional)</div>
          <label className="cursor-pointer text-sm px-3 py-1.5 rounded bg-gray-900 text-white">
            Upload
            <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => onFiles(e.target.files)} />
          </label>
        </div>
        <div className="flex gap-3 flex-wrap">
          {images.map((im, i) => (
            <div key={i} className="relative w-28 h-28 border rounded overflow-hidden">
              <img src={typeof im === 'string' ? im : (im?.url || im)} alt={`img-${i}`} className="w-full h-full object-cover" />
              <button type="button" onClick={() => onRemoveImage(i)} className="absolute top-1 right-1 bg-white/90 text-xs px-1 rounded">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-emerald-700 text-white">{saving ? 'Saving...' : 'Save changes'}</button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded border">Cancel</button>
      </div>
    </form>
  )
}
