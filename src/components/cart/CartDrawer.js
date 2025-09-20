"use client"

import { useCart } from "@/context/CartContext"
import { useRouter } from "next/navigation"
import { inr } from "@/lib/utils"
import Image from "next/image"
import { XMarkIcon, ShoppingBagIcon, TrashIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"

export default function CartDrawer({ open, onClose }) {
  const { cart, removeItem, clearCart } = useCart()
  const router = useRouter()

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[380px] bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBagIcon className="h-5 w-5 text-brand" />
            My Cart
          </h2>
          <button onClick={onClose}>
            <XMarkIcon className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b pb-3">
                <div className="relative w-16 h-16 rounded bg-neutral-100 overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.title}</p>
                  {item.variant?.color && (
                    <p className="text-xs text-gray-500">Color: {item.variant.color}</p>
                  )}
                  {item.variant?.size && (
                    <p className="text-xs text-gray-500">Size: {item.variant.size}</p>
                  )}
                  <p className="text-sm font-semibold">{inr(item.price)}</p>
                  <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 rounded hover:bg-red-50"
                >
                  <TrashIcon className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">{inr(subtotal)}</span>
            </div>
            <button
              onClick={() => {
                onClose()
                router.push("/checkout")
              }}
              className="w-full bg-brand text-white py-3 rounded-lg font-medium shadow hover:shadow-md"
            >
              Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full text-sm text-gray-500 hover:text-red-600"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
