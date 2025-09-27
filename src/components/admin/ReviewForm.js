"use client"

import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import toast from "react-hot-toast"

// compress image to webp and ensure size <= 500KB
async function compressToWebp(file, maxSize = 500 * 1024) {
  if (!file.type.startsWith("image/")) return file
  const img = await createImageBitmap(file)
  const canvas = new OffscreenCanvas(img.width, img.height)
  const ctx = canvas.getContext("2d")
  ctx.drawImage(img, 0, 0)

  let quality = 0.92
  let blob = await canvas.convertToBlob({ type: "image/webp", quality })
  // reduce quality until under maxSize or quality too low
  while (blob.size > maxSize && quality > 0.2) {
    quality -= 0.12
    blob = await canvas.convertToBlob({ type: "image/webp", quality })
  }
  // if still too big, resize down
  let width = img.width
  let height = img.height
  while (blob.size > maxSize && Math.max(width, height) > 400) {
    width = Math.round(width * 0.8)
    height = Math.round(height * 0.8)
    const tmpCanvas = new OffscreenCanvas(width, height)
    const tctx = tmpCanvas.getContext("2d")
    tctx.drawImage(img, 0, 0, width, height)
    blob = await tmpCanvas.convertToBlob({ type: "image/webp", quality })
  }

  return new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), { type: "image/webp" })
}

export default function ReviewForm({ onSaved }) {
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [orderId, setOrderId] = useState("")
  const [channel, setChannel] = useState("whatsapp")
  const [date, setDate] = useState("")
  const [message, setMessage] = useState("")
  const [images, setImages] = useState([])
  const [saving, setSaving] = useState(false)

  const onFiles = async (files) => {
    if (!files || !files.length) return
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

  const onRemoveImage = (idx) => {
    if (!confirm("Remove this image?")) return
    setImages((p) => p.filter((_, i) => i !== idx))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!name || !message) {
      toast.error("Name and message are required")
      return
    }
    setSaving(true)
    try {
      const docRef = await addDoc(collection(db, "community_reviews"), {
        name,
        city,
        orderId,
        channel,
        date: date || null,
        message,
        images,
        createdAt: serverTimestamp(),
      })
      toast.success("Saved review")
      onSaved?.(docRef.id)
    } catch (err) {
      console.error(err)
      toast.error("Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4">
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
              <img src={im.url} alt={`img-${i}`} className="w-full h-full object-cover" />
              <button type="button" onClick={() => onRemoveImage(i)} className="absolute top-1 right-1 bg-white/90 text-xs px-1 rounded">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-emerald-700 text-white">{saving ? "Saving..." : "Save review"}</button>
      </div>
    </form>
  )
}
