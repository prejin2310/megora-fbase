import { db } from "./firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

// ✅ Search products by title or SKU
export async function searchProducts(searchTerm) {
  const productsRef = collection(db, "products")

  // Firestore simple match (expand later with indexing)
  const q = query(productsRef, where("keywords", "array-contains", searchTerm.toLowerCase()))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
