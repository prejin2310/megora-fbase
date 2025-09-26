"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import toast from "react-hot-toast"

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

const getVariantId = (v) => (v && (typeof v === "object" ? v.id : v)) || "default"

const mergeCarts = (a = [], b = []) => {
  const map = new Map()
  ;[...a, ...b].forEach((item) => {
    const variantId = getVariantId(item.variant)
    const key = `${item.id}-${variantId}`
    const itemQty = item.qty ?? item.quantity ?? 0
    if (map.has(key)) {
      const existing = map.get(key)
      const existingQty = existing.qty ?? existing.quantity ?? 0
      map.set(key, { ...existing, qty: existingQty + itemQty, quantity: existingQty + itemQty })
    } else {
      map.set(key, { ...item, qty: itemQty || 1, quantity: itemQty || 1 })
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

  const variantEqual = (a, b) => {
    if (!a && !b) return true
    if (!a || !b) return false
    const aId = getVariantId(a)
    const bId = getVariantId(b)
    return String(aId) === String(bId)
  }

  const addItem = useCallback(
    (item) => {
      // derive updated cart from current state to avoid side-effects inside updater
      const exists = cart.find((p) => p.id === item.id && variantEqual(p.variant, item.variant))
      const itemQty = item.qty ?? item.quantity ?? 1
      let updated

      if (exists) {
        updated = cart.map((p) =>
          p.id === item.id && variantEqual(p.variant, item.variant)
            ? { ...p, qty: (p.qty ?? p.quantity ?? 0) + itemQty, quantity: (p.qty ?? p.quantity ?? 0) + itemQty }
            : p
        )
      } else {
        // keep variant as provided (object or id) but ensure qty/quantity exist
        updated = [...cart, { ...item, qty: itemQty, quantity: itemQty }]
      }

      setCart(updated)
      syncCart(updated)
      toast.success("Added to cart")
      if (!user) toast("Login to save your cart for later", { icon: "!" })
    },
    [cart, syncCart, user]
  )

  // Accept signature updateQuantity(id, newQty, variant?) to match callers in UI
  const updateQuantity = useCallback(
    (id, newQty, variant) => {
      const qtyNum = Number(newQty) || 1
      const updated = cart.map((p) =>
        p.id === id && (variant === undefined ? true : variantEqual(p.variant, variant))
          ? { ...p, qty: Math.max(1, qtyNum), quantity: Math.max(1, qtyNum) }
          : p
      )
      setCart(updated)
      syncCart(updated)
      toast.success("Cart updated")
    },
    [cart, syncCart]
  )

  const removeItem = useCallback(
    (id, variant) => {
      const updated = cart.filter((p) => {
        if (p.id !== id) return true
        if (variant === undefined) return false // remove all variants for id when variant not provided
        return !variantEqual(p.variant, variant)
      })
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
