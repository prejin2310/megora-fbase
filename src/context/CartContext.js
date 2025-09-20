"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { auth } from "@/lib/firebase"
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
        try {
          const ref = doc(db, "users", u.uid, "meta", "cart")
          const snap = await getDoc(ref)
          if (snap.exists()) {
            setCart(snap.data().items || [])
          } else {
            setCart([])
          }
        } catch (err) {
          console.error("Failed to load cart:", err)
        }
      } else {
        setCart([])
      }
    })
    return () => unsub()
  }, [])

  /* ----------------- Firestore sync ----------------- */
  useEffect(() => {
    if (!user) return
    const ref = doc(db, "users", user.uid, "meta", "cart")
    setDoc(ref, { items: cart }, { merge: true }).catch((err) =>
      console.error("Cart sync failed:", err)
    )
  }, [cart, user])

  /* ----------------- Cart Actions ----------------- */
  const addItem = (item) => {
    if (!user) {
      toast.error("Please login to add items to cart")
      return
    }

    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id)
      if (exists) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + item.qty } : p
        )
      }
      return [...prev, item]
    })

    toast.success("Added to cart")
  }

  const removeItem = (id) => {
    if (!user) return
    setCart((prev) => prev.filter((p) => p.id !== id))
    toast.success("Removed from cart")
  }

  const clearCart = () => {
    if (!user) return
    setCart([])
    toast.success("Cart cleared")
  }

  const buyNow = (item) => {
    if (!user) return toast.error("Please login to continue")
    sessionStorage.setItem("buyNow", JSON.stringify(item))
    window.location.href = "/checkout?buyNow=true"
  }

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, clearCart, buyNow }}
    >
      {children}
    </CartContext.Provider>
  )
}
