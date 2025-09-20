import { db } from "./firebase"
import { collection, query, where, onSnapshot, getDocs, doc, getDoc, orderBy, limit } from "firebase/firestore"

// 🔹 Real-time subscription search by keywords
export function subscribeProducts(searchTerm, callback) {
  if (!searchTerm || searchTerm.length < 2) return () => {}

  const q = query(
    collection(db, "products"),
    where("keywords", "array-contains", searchTerm.toLowerCase())
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    callback(products)
  })

  return unsubscribe
}

// 🔹 One-time search (fallback)
export async function searchProducts(searchTerm) {
  if (!searchTerm || searchTerm.length < 2) return []
  const q = query(
    collection(db, "products"),
    where("keywords", "array-contains", searchTerm.toLowerCase())
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// 🔹 Fetch store settings
export async function getStoreSettings() {
  const ref = doc(db, "settings", "store")
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

// 🔹 Fetch latest products
export async function getNewArrivals(count = 6) {
  const q = query(
    collection(db, "products"),
    orderBy("createdAt", "desc"),
    limit(count)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
