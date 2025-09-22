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
  addDoc,
  updateDoc,
} from "firebase/firestore"

//
// 🔹 Generate keywords from product fields
//
function generateKeywords(title = "", sku = "", category = "") {
  const keywords = new Set()

  const addWords = (str) => {
    if (!str) return
    str
      .toLowerCase()
      .split(/\s+/)
      .forEach((word) => {
        keywords.add(word)
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
// 🔹 Real-time subscription search
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
// 🔹 One-time search
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
  const keywords = generateKeywords(
    product.title,
    product.sku,
    product.categoryName
  )
  return await addDoc(collection(db, "products"), {
    ...product,
    keywords,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

//
// 🔹 Update existing product
//
export async function updateProduct(id, data) {
  const keywords = generateKeywords(data.title, data.sku, data.categoryName)
  const ref = doc(db, "products", id)
  await updateDoc(ref, {
    ...data,
    keywords,
    updatedAt: new Date(),
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

//
// 🔹 Get random products
//
export async function getRandomProducts(limit = 10) {
  try {
    const snap = await getDocs(collection(db, "products"))
    const allProducts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const shuffled = allProducts.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, limit)
  } catch (err) {
    console.error("Error fetching random products:", err)
    return []
  }
}

//
// 🔹 Get ALL products
//
export async function getAllProducts() {
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("db:getAllProducts", error)
    return []
  }
}

//
// 🔹 Fetch categories
//
export async function getCategories() {
  try {
    const q = query(collection(db, "categories"), orderBy("name", "asc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("db:getCategories", error)
    return []
  }
}

//
// 🔹 Filtered products (single clean version)
//
export async function getFilteredProducts({ categoryId, priceRange, sort }) {
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    let results = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt || Date.now()),
        price: Number(data.price) || 0,
      }
    })

    // ✅ Category filter
    if (categoryId && categoryId !== "all") {
      results = results.filter((p) => p.categoryId === categoryId)
    }

    // ✅ Price filter (only if user actually changes it)
    if (priceRange && priceRange.length === 2) {
      const [min, max] = priceRange
      if (min > 0 || max < 999999) {
        results = results.filter(
          (p) => p.price >= min && (max ? p.price <= max : true)
        )
      }
    }

    // ✅ Sorting
    if (sort === "priceLow") {
      results.sort((a, b) => a.price - b.price)
    } else if (sort === "priceHigh") {
      results.sort((a, b) => b.price - a.price)
    } else if (sort === "newest") {
      results.sort((a, b) => b.createdAt - a.createdAt)
    } else {
      // Default: keep as Firestore gave (newest first)
      results.sort((a, b) => b.createdAt - a.createdAt)
    }

    console.log(
      `Fetched ${results.length} products | sort=${sort} | category=${categoryId} | price=${priceRange}`
    )

    return results
  } catch (error) {
    console.error("db:getFilteredProducts", error)
    return []
  }
}
