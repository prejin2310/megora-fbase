"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import toast from "react-hot-toast"

export default function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { cart, clearCart } = useCart()

  const [buyNowItem, setBuyNowItem] = useState(null)

  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  })
  const [giftWrap, setGiftWrap] = useState(false)
  const [delivery, setDelivery] = useState("normal")
  const [payment, setPayment] = useState("cod")
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState(null)

  // force login
  useEffect(() => {
    if (!user) {
      toast.error("Please login to continue checkout")
      router.push("/login")
    }
  }, [user, router])

  // read buyNow item from query
  useEffect(() => {
    const buyNow = searchParams.get("buyNow")
    if (buyNow) {
      try {
        setBuyNowItem(JSON.parse(decodeURIComponent(buyNow)))
      } catch {
        console.error("Invalid buyNow param")
      }
    }
  }, [searchParams])

  if (!user) return null

  const items = buyNowItem ? [buyNowItem] : cart

  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0)
  const giftCharge = giftWrap ? 30 : 0
  const deliveryCharge = delivery === "express" ? 50 : 0
  const total = subtotal + giftCharge + deliveryCharge

  const handleConfirm = async () => {
    if (!shipping.name || !shipping.address || !shipping.phone) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setSubmitting(true)
      const orderRef = await addDoc(collection(db, "orders"), {
        customerId: user.uid,
        customerName: shipping.name,
        customerEmail: shipping.email,
        customerPhone: shipping.phone,
        shipping,
        items,
        subtotal,
        giftWrap,
        delivery,
        deliveryCharge,
        payment,
        total,
        status: payment === "cod" ? "pending" : "paid",
        createdAt: serverTimestamp(),
      })
      clearCart()
      setOrderId(orderRef.id)
      toast.success("Order placed successfully!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to confirm order")
    } finally {
      setSubmitting(false)
    }
  }

  if (orderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4 text-green-600">
          ✅ Order Confirmed
        </h1>
        <p className="mb-2">Your order has been placed successfully.</p>
        <p className="font-mono text-gray-700">Transaction ID: {orderId}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-6 py-3 rounded-lg bg-brand text-white"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
      {/* Shipping form */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>

        {/* Shipping info */}
        <div className="space-y-4 bg-white p-6 rounded-xl shadow">
          <h2 className="font-medium text-lg">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Full Name" value={shipping.name}
              onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input placeholder="Email" value={shipping.email}
              onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input placeholder="Phone" value={shipping.phone}
              onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input placeholder="Pincode" value={shipping.pincode}
              onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <input placeholder="Address" value={shipping.address}
            onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
            className="border rounded-lg px-3 py-2 w-full"
          />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="City" value={shipping.city}
              onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input placeholder="State" value={shipping.state}
              onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Options */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={giftWrap}
              onChange={(e) => setGiftWrap(e.target.checked)}
            />
            <span>Gift wrap my order (+₹30)</span>
          </label>

          <div>
            <h3 className="font-medium mb-2">Delivery Method</h3>
            <label className="block">
              <input type="radio" name="delivery" value="normal"
                checked={delivery === "normal"}
                onChange={(e) => setDelivery(e.target.value)}
              />
              <span className="ml-2">Normal (5–7 days) – Free</span>
            </label>
            <label className="block">
              <input type="radio" name="delivery" value="express"
                checked={delivery === "express"}
                onChange={(e) => setDelivery(e.target.value)}
              />
              <span className="ml-2">Express (3–5 days) – ₹50</span>
            </label>
          </div>

          <div>
            <h3 className="font-medium mb-2">Payment Method</h3>
            <label className="block">
              <input type="radio" name="payment" value="cod"
                checked={payment === "cod"}
                onChange={(e) => setPayment(e.target.value)}
              />
              <span className="ml-2">Cash on Delivery</span>
            </label>
            <label className="block">
              <input type="radio" name="payment" value="razorpay"
                checked={payment === "razorpay"}
                onChange={(e) => setPayment(e.target.value)}
              />
              <span className="ml-2">Razorpay (Card/UPI)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4 h-fit">
        <h2 className="font-medium text-lg">Order Summary</h2>
        <ul className="divide-y">
          {items.map((i, idx) => (
            <li key={idx} className="flex justify-between py-2 text-sm">
              <span>{i.title} × {i.qty}</span>
              <span>₹{(i.price * i.qty).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        {giftWrap && (
          <div className="flex justify-between text-sm">
            <span>Gift Wrap</span>
            <span>₹30</span>
          </div>
        )}
        {delivery === "express" && (
          <div className="flex justify-between text-sm">
            <span>Express Delivery</span>
            <span>₹50</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full mt-4 px-6 py-3 rounded-lg bg-brand text-white disabled:opacity-50"
        >
          {submitting ? "Placing Order…" : "Confirm Order"}
        </button>
      </div>
    </div>
  )
}
