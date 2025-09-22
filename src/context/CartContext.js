"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import toast from "react-hot-toast"

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

const mergeCarts = (a = [], b = []) => {
  const map = new Map()
  ;[...a, ...b].forEach((item) => {
    const key = `${item.id}-${item.variant || "default"}`
    if (map.has(key)) {
      const existing = map.get(key)
      map.set(key, { ...existing, qty: existing.qty + item.qty })
    } else {
      map.set(key, { ...item })
    }
  })
  return [...map.values()]
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)

      if (u) {
        const ref = doc(db, "users", u.uid, "meta", "cart")
        const snap = await getDoc(ref)
        const firestoreCart = snap.exists() ? snap.data().items || [] : []

        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]")
        const merged = mergeCarts(firestoreCart, guestCart)

        setCart(merged)
        await setDoc(ref, { items: merged }, { merge: true })

        localStorage.removeItem("guest_cart")
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]")
        setCart(guestCart)
      }
    })
    return () => unsub()
  }, [])

  const syncCart = useCallback(
    async (newCart) => {
      if (user) {
        const ref = doc(db, "users", user.uid, "meta", "cart")
        await setDoc(ref, { items: newCart }, { merge: true })
      } else {
        localStorage.setItem("guest_cart", JSON.stringify(newCart))
      }
    },
    [user]
  )

  const addItem = useCallback(
    (item) => {
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
        if (!user) toast("Login to save your cart for later", { icon: "!" })

        return updated
      })
    },
    [syncCart, user]
  )

  const updateQuantity = useCallback(
    (id, variant, newQty) => {
      setCart((prev) => {
        const updated = prev.map((p) =>
          p.id === id && p.variant === variant
            ? { ...p, qty: Math.max(1, newQty) }
            : p
        )
        syncCart(updated)
        toast.success("Cart updated")
        return updated
      })
    },
    [syncCart]
  )

  const removeItem = useCallback(
    (id, variant) => {
      setCart((prev) => {
        const updated = prev.filter((p) => !(p.id === id && p.variant === variant))
        syncCart(updated)
        return updated
      })
      toast.success("Removed from cart")
    },
    [syncCart]
  )

  const clearCart = useCallback(() => {
    setCart([])
    syncCart([])
    toast.success("Cart cleared")
  }, [syncCart])

  const buyNow = useCallback((item) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("buyNow", JSON.stringify(item))
    }
  }, [])

  // ✅ Export both names: removeItem & removeFromCart
  const value = useMemo(
    () => ({
      cart,
      addItem,
      updateQuantity,
      removeItem,
      removeFromCart: removeItem, // alias
      clearCart,
      buyNow,
    }),
    [addItem, updateQuantity, buyNow, cart, clearCart, removeItem]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
