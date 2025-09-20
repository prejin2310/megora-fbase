import { db } from "./firebase"
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
  setDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore"

//
// 🔹 Generate keywords from product fields
//
function generateKeywords(title = "", sku = "", category = "") {
  const keywords = new Set()

  // break words by space
  const addWords = (str) => {
    if (!str) return
    str
      .toLowerCase()
      .split(/\s+/)
      .forEach((word) => {
        keywords.add(word)
        // add prefixes for better search
        for (let i = 1; i <= word.length; i++) {
          keywords.add(word.substring(0, i))
        }
      })
  }

  addWords(title)
  addWords(sku)
  addWords(category)

  return Array.from(keywords)
}

//
// 🔹 Real-time subscription search by keywords
//
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

//
// 🔹 One-time search (fallback)
//
export async function searchProducts(searchTerm) {
  if (!searchTerm || searchTerm.length < 2) return []
  const q = query(
    collection(db, "products"),
    where("keywords", "array-contains", searchTerm.toLowerCase())
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

//
// 🔹 Add new product (auto keywords)
//
export async function addProduct(product) {
  const keywords = generateKeywords(product.title, product.sku, product.categoryName)
  return await addDoc(collection(db, "products"), {
    ...product,
    keywords,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

//
// 🔹 Update existing product (auto keywords)
//
export async function updateProduct(id, data) {
  const keywords = generateKeywords(data.title, data.sku, data.categoryName)
  const ref = doc(db, "products", id)
  await updateDoc(ref, {
    ...data,
    keywords,
    updatedAt: new Date().toISOString(),
  })
}

//
// 🔹 Fetch store settings
//
export async function getStoreSettings() {
  const ref = doc(db, "settings", "store")
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

//
// 🔹 Fetch latest products
//
export async function getNewArrivals(count = 6) {
  const q = query(
    collection(db, "products"),
    orderBy("createdAt", "desc"),
    limit(count)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}


export async function getRandomProducts(limit = 10) {
  try {
    const snap = await getDocs(collection(db, "products"))
    const allProducts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    // shuffle and take N
    const shuffled = allProducts.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, limit)
  } catch (err) {
    console.error("Error fetching random products:", err)
    return []
  }
}

// Fetch products by categoryId
export async function getProductsByCategory(categoryId, count = 10) {
  try {
    const q = query(
      collection(db, "products"),
      where("categoryId", "==", categoryId),
      limit(count)
    )

    const snap = await getDocs(q)
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error("Error fetching products:", err)
    return []
  }
}
