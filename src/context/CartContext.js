"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  // Load from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem("cart")
    if (stored) setCart(JSON.parse(stored))
  }, [])

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product, variant, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.variantId === variant.id
      )
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && item.variantId === variant.id
            ? { ...item, qty: item.qty + qty }
            : item
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          variantId: variant.id,
          options: variant.options,
          price: variant.priceINR,
          fakePrice: variant.fakePriceINR,
          qty,
          image:
            variant.images?.find((im) => im.thumbnail)?.url ||
            product.media?.find((m) => m.thumbnail)?.url ||
            "/demo/product1.jpg",
        },
      ]
    })
  }

  const removeFromCart = (productId, variantId) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId))
    )
  }

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
