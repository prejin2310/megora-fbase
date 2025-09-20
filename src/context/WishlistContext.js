"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { useAuth } from "./AuthContext"
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore"
import toast from "react-hot-toast"

const WishlistContext = createContext()
export const useWishlist = () => useContext(WishlistContext)

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    if (!user) {
      setWishlist([])
      return
    }
    const fetch = async () => {
      const snap = await getDocs(collection(db, "users", user.uid, "wishlist"))
      setWishlist(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    }
    fetch()
  }, [user])

  const toggleWishlist = async (product) => {
    if (!user) return toast.error("Please login to use wishlist")

    const exists = wishlist.find((w) => w.id === product.id)
    try {
      if (exists) {
        await deleteDoc(doc(db, "users", user.uid, "wishlist", product.id))
        setWishlist((prev) => prev.filter((w) => w.id !== product.id))
        toast.success("Removed from wishlist")
      } else {
        await setDoc(doc(db, "users", user.uid, "wishlist", product.id), product)
        setWishlist((prev) => [...prev, product])
        toast.success("Added to wishlist")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to update wishlist")
    }
  }

  const isWishlisted = (id) => wishlist.some((w) => w.id === id)

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  )
}
