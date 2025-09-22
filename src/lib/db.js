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
  serverTimestamp,
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
// 🔹 Add new product (auto keywords + serverTimestamp)
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
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
    updatedAt: serverTimestamp(),
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
export async function getFilteredProducts({ categorySlug, priceRange, sort }) {
  let products = []

  try {
    // 1️⃣ Find category by slug
    let categoryId = null
    if (categorySlug && categorySlug !== "all") {
      const catQuery = query(
        collection(db, "categories"),
        where("slug", "==", categorySlug.toLowerCase())
      )
      const catSnap = await getDocs(catQuery)
      if (!catSnap.empty) {
        categoryId = catSnap.docs[0].id
      }
    }

    // 2️⃣ Query products
    let prodQuery
    if (categoryId) {
      prodQuery = query(
        collection(db, "products"),
        where("categoryId", "==", categoryId)
      )
    } else {
      prodQuery = collection(db, "products") // all
    }

    const prodSnap = await getDocs(prodQuery)
    products = prodSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    // 3️⃣ Apply filters
    if (priceRange) {
      products = products.filter((p) => {
        const price =
          p.variants?.[0]?.prices?.INR ||
          p.variants?.[0]?.option?.priceINR ||
          p.priceINR ||
          0
        return price >= priceRange[0] && price <= priceRange[1]
      })
    }

    if (sort === "priceLow") {
      products.sort((a, b) => getPrice(a) - getPrice(b))
    } else if (sort === "priceHigh") {
      products.sort((a, b) => getPrice(b) - getPrice(a))
    } else if (sort === "newest") {
      products.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    }

    return products
  } catch (err) {
    console.error("getFilteredProducts error:", err)
    return []
  }
}

//
// 🔹 Get products by categoryId
//
export async function getProductsByCategory(slug, max = 12) {
  try {
    // 1️⃣ Find category by slug
    const catQuery = query(collection(db, "categories"), where("slug", "==", slug))
    const catSnap = await getDocs(catQuery)
    if (catSnap.empty) return []

    const categoryId = catSnap.docs[0].id

    // 2️⃣ Get products with that categoryId
    const prodQuery = query(
      collection(db, "products"),
      where("categoryId", "==", categoryId),
      limit(max)
    )
    const prodSnap = await getDocs(prodQuery)
    return prodSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error("getProductsByCategory error:", err)
    return []
  }
}

export async function getUserById(uid) {
  try {
    const ref = doc(db, "users", uid)
    const snap = await getDoc(ref)
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (error) {
    console.error("db:getUserById", error)
    return null
  }
}
