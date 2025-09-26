"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import toast from "react-hot-toast"

const WishlistContext = createContext()
export const useWishlist = () => useContext(WishlistContext)

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([])
  const [user, setUser] = useState(null)

  /* ----------------- Auth listener ----------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)

      if (u) {
        const ref = doc(db, "users", u.uid, "meta", "wishlist")
        const snap = await getDoc(ref)
        const firestoreList = snap.exists() ? snap.data().items || [] : []

        const guestList = JSON.parse(localStorage.getItem("guest_wishlist") || "[]")
        const merged = [...new Map([...firestoreList, ...guestList].map(i => [i.id, i])).values()]

        setWishlist(merged)
        await setDoc(ref, { items: merged }, { merge: true })

        localStorage.removeItem("guest_wishlist")
      } else {
        const guestList = JSON.parse(localStorage.getItem("guest_wishlist") || "[]")
        setWishlist(guestList)
      }
    })
    return () => unsub()
  }, [])

  const syncWishlist = async (newList) => {
    if (user) {
      const ref = doc(db, "users", user.uid, "meta", "wishlist")
      await setDoc(ref, { items: newList }, { merge: true })
    } else {
      localStorage.setItem("guest_wishlist", JSON.stringify(newList))
    }
  }

  /* ----------------- Wishlist Actions ----------------- */
  const toggleWishlist = (item) => {
    const exists = wishlist.find((p) => p.id === item.id)
    let updated

    if (exists) {
      updated = wishlist.filter((p) => p.id !== item.id)
      setWishlist(updated)
      syncWishlist(updated)
      toast("Removed from wishlist", { icon: "💔" })
    } else {
      updated = [...wishlist, item]
      setWishlist(updated)
      syncWishlist(updated)
      toast.success("Added to wishlist")
      if (!user) toast("Login to save your wishlist across devices", { icon: "⚠️" })
    }
  }

  const isWishlisted = (id) => wishlist.some((i) => i.id === id)

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  )
}
