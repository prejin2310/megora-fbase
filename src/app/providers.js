"use client"

import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"
import { WishlistProvider } from "@/context/WishlistContext"
import { Toaster } from "react-hot-toast"

export default function Providers({ children }) {
  return (
   <AuthProvider>
  <CartProvider>
    <WishlistProvider>
      <Toaster
        position="top-right"
        containerClassName="site-toaster"
        containerStyle={{ top: 16, left: 16, zIndex: 9999 }}
        toastOptions={{
          // sensible defaults for the site
          duration: 3500,
          style: {
            padding: '0.6rem 0.9rem',
            borderRadius: '0.5rem',
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)'
          }
        }}
      />
      {children}
    </WishlistProvider>
  </CartProvider>
</AuthProvider>

  )
}
