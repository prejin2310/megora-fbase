"use client"

import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"
import { WishlistProvider } from "@/context/WishlistContext"
import { Toaster } from "react-hot-toast"
import toast from "react-hot-toast"

export default function Providers({ children }) {
  return (
   <AuthProvider>
  <CartProvider>
    <WishlistProvider>
      <div
        className="site-toaster-wrapper"
        // clicking any toast will dismiss (dismisses all) — handy quick dismiss
        onClick={(e) => {
          // if user clicked inside a toast element, dismiss all toasts
          if (e.target.closest && e.target.closest('.react-hot-toast')) {
            toast.dismiss()
          }
        }}
      >
        <Toaster
          position="bottom-center"
          containerClassName="site-toaster"
          containerStyle={{ bottom: 20, left: 0, right: 0, zIndex: 9999 }}
          toastOptions={{
            // reduced duration so toasts are not too persistent
            duration: 2800,
            // glassy base style applied to all toasts
            style: {
              padding: '0.9rem 1.1rem',
              borderRadius: '0.75rem',
              boxShadow: '0 12px 40px rgba(2,6,23,0.60)',
              minHeight: '52px',
              fontSize: '0.98rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              color: '#ffffff',
              // darker glass for better contrast while retaining blur
              background: 'rgba(17,24,39,0.72)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.06)'
            },
            success: {
              duration: 2600,
              style: {
                // darker solid green glass for improved contrast
                background: 'linear-gradient(135deg, rgba(4,120,87,0.92), rgba(6,95,70,0.86))',
                color: '#ffffff',
                border: '1px solid rgba(4,120,87,0.9)'
              }
            },
            error: {
              duration: 3600,
              style: {
                background: 'linear-gradient(135deg, rgba(153,27,27,0.16), rgba(185,28,28,0.10))',
                color: '#fff1f2',
                border: '1px solid rgba(220,38,38,0.12)'
              }
            }
          }}
        />
      </div>
      {children}
    </WishlistProvider>
  </CartProvider>
</AuthProvider>

  )
}
