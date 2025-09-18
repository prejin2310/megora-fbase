import { db } from "./firebase"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { doc, getDoc } from "firebase/firestore"

// ✅ Search products by title or SKU
export async function searchProducts(searchTerm) {
  const productsRef = collection(db, "products")

  // Firestore simple match (expand later with indexing)
  const q = query(productsRef, where("keywords", "array-contains", searchTerm.toLowerCase()))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// ✅ Fetch store settings (banner etc.)
export async function getStoreSettings() {
  const ref = doc(db, "settings", "store")
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

// Fetch latest products by createdAt
export async function getNewArrivals(count = 6) {
  const q = query(
    collection(db, "products"),
    orderBy("createdAt", "desc"),
    limit(count)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}