"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import toast from "react-hot-toast"

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [user, setUser] = useState(null)

  /* ----------------- Auth listener ----------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)

      if (u) {
        // load Firestore cart
        const ref = doc(db, "users", u.uid, "meta", "cart")
        const snap = await getDoc(ref)
        const firestoreCart = snap.exists() ? snap.data().items || [] : []

        // merge guest cart from localStorage
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]")
        const merged = mergeCarts(firestoreCart, guestCart)

        setCart(merged)
        await setDoc(ref, { items: merged }, { merge: true })

        localStorage.removeItem("guest_cart") // clear guest cart
      } else {
        // guest mode → load local cart
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]")
        setCart(guestCart)
      }
    })
    return () => unsub()
  }, [])

  /* ----------------- Helpers ----------------- */
  const mergeCarts = (a, b) => {
    const map = new Map()
    ;[...a, ...b].forEach((item) => {
      const key = `${item.id}-${item.variant || "default"}`
      if (map.has(key)) {
        map.set(key, { ...map.get(key), qty: map.get(key).qty + item.qty })
      } else {
        map.set(key, { ...item })
      }
    })
    return [...map.values()]
  }

  const syncCart = async (newCart) => {
    if (user) {
      const ref = doc(db, "users", user.uid, "meta", "cart")
      await setDoc(ref, { items: newCart }, { merge: true })
    } else {
      localStorage.setItem("guest_cart", JSON.stringify(newCart))
    }
  }

  /* ----------------- Cart Actions ----------------- */
  const addItem = (item) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id && p.variant === item.variant)
      let updated
      if (exists) {
        updated = prev.map((p) =>
          p.id === item.id && p.variant === item.variant
            ? { ...p, qty: p.qty + item.qty }
            : p
        )
      } else {
        updated = [...prev, { ...item, qty: item.qty ?? 1 }]
      }

      syncCart(updated)

      toast.success("Added to cart")
      if (!user) toast("Login to save your cart for later", { icon: "⚠️" })

      return updated
    })
  }

  const removeItem = (id, variant) => {
    setCart((prev) => {
      const updated = prev.filter((p) => !(p.id === id && p.variant === variant))
      syncCart(updated)
      return updated
    })
    toast.success("Removed from cart")
  }

  const clearCart = () => {
    setCart([])
    syncCart([])
    toast.success("Cart cleared")
  }

  const buyNow = (item) => {
    sessionStorage.setItem("buyNow", JSON.stringify(item))
    window.location.href = "/checkout?buyNow=true"
  }

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, clearCart, buyNow }}>
      {children}
    </CartContext.Provider>
  )
}
