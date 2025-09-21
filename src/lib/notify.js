import { addDoc, collection, serverTimestamp } from "firebase/firestore"

import { db } from "@/lib/firebase"

export async function createNotifyRequest({
  email,
  product,
  variant,
  userId,
}) {
  const safeEmail = (email || "").trim()
  if (!safeEmail || !product) return

  const payload = {
    email: safeEmail,
    productId: product?.id || null,
    productHandle: product?.handle || null,
    productTitle: product?.title || "",
    userId: userId || null,
    createdAt: serverTimestamp(),
  }

  if (variant) {
    payload.variantId = variant?.id || null
    payload.variantName = variant?.option?.name || variant?.title || null
    payload.variantSku = variant?.sku || null
  }

  return addDoc(collection(db, "notifyRequests"), payload)
}
