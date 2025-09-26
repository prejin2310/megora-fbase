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
      // derive updated cart from current state to avoid side-effects inside updater
      const exists = cart.find((p) => p.id === item.id && p.variant === item.variant)
      let updated

      if (exists) {
        updated = cart.map((p) =>
          p.id === item.id && p.variant === item.variant ? { ...p, qty: p.qty + item.qty } : p
        )
      } else {
        updated = [...cart, { ...item, qty: item.qty ?? 1 }]
      }

      setCart(updated)
      syncCart(updated)
      toast.success("Added to cart")
      if (!user) toast("Login to save your cart for later", { icon: "!" })
    },
    [cart, syncCart, user]
  )

  const updateQuantity = useCallback(
    (id, variant, newQty) => {
      const updated = cart.map((p) =>
        p.id === id && p.variant === variant ? { ...p, qty: Math.max(1, newQty) } : p
      )
      setCart(updated)
      syncCart(updated)
      toast.success("Cart updated")
    },
    [cart, syncCart]
  )

  const removeItem = useCallback(
    (id, variant) => {
      const updated = cart.filter((p) => !(p.id === id && p.variant === variant))
      setCart(updated)
      syncCart(updated)
      toast.success("Removed from cart")
    },
    [cart, syncCart]
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
