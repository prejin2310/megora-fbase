"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  query,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"
import toast from "react-hot-toast"
import Script from "next/script"
import { inr } from "@/lib/utils"

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  })

  /* ----------------- Fetch Cart ----------------- */
  useEffect(() => {
    if (!user) {
      toast.error("Please login to checkout")
      router.push("/login")
      return
    }
    const fetchCart = async () => {
      try {
        setLoading(true)
        const q = query(collection(db, "users", user.uid, "cart"))
        const snap = await getDocs(q)
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setCart(items)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load cart")
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [user, router])

  if (loading) return <div className="p-10 text-center">Loading checkout…</div>
  if (!cart.length) return <div className="p-10 text-center">Cart is empty.</div>

  const total = cart.reduce((a, c) => a + c.price * c.qty, 0)

  /* ----------------- Create Order ----------------- */
  const createOrder = async () => {
    if (!shipping.name || !shipping.phone || !shipping.addressLine1 || !shipping.city) {
      toast.error("Please fill shipping details")
      return
    }
    try {
      const orderId = "ORD-" + Date.now()
      const orderRef = doc(db, "orders", orderId)

      await setDoc(orderRef, {
        orderId,
        userId: user.uid,
        items: cart,
        total,
        status: "pending",
        createdAt: serverTimestamp(),
        customer: {
          name: shipping.name,
          email: user.email,
          phone: shipping.phone,
        },
        shipping,
        tracking: null,
      })

      // Razorpay integration (can enable later)
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "test_key",
        amount: total * 100,
        currency: "INR",
        name: "Megora Jewels",
        description: "Order Payment",
        handler: async function (response) {
          await setDoc(
            orderRef,
            {
              status: "paid",
              paymentId: response.razorpay_payment_id,
              paidAt: new Date(),
            },
            { merge: true }
          )
          toast.success("Payment successful")
          router.push("/orders/" + orderId)
        },
        prefill: {
          email: user.email,
        },
        theme: { color: "#003D3A" },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error(err)
      toast.error("Order failed")
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>

      {/* Shipping Form */}
      <div className="space-y-3 border rounded-lg p-4 bg-neutral-50">
        <h2 className="text-lg font-medium">Shipping Details</h2>
        <input
          placeholder="Full Name"
          value={shipping.name}
          onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          placeholder="Phone"
          value={shipping.phone}
          onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          placeholder="Address Line 1"
          value={shipping.addressLine1}
          onChange={(e) =>
            setShipping({ ...shipping, addressLine1: e.target.value })
          }
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          placeholder="Address Line 2"
          value={shipping.addressLine2}
          onChange={(e) =>
            setShipping({ ...shipping, addressLine2: e.target.value })
          }
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="City"
            value={shipping.city}
            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <input
            placeholder="State"
            value={shipping.state}
            onChange={(e) =>
              setShipping({ ...shipping, state: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Pincode"
            value={shipping.pincode}
            onChange={(e) =>
              setShipping({ ...shipping, pincode: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <input
            placeholder="Country"
            value={shipping.country}
            onChange={(e) =>
              setShipping({ ...shipping, country: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Cart Summary */}
      <div className="space-y-2 border rounded-lg p-4">
        <h2 className="text-lg font-medium mb-2">Order Summary</h2>
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between text-sm border-b pb-1"
          >
            <span>{item.title} × {item.qty}</span>
            <span>{inr(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold text-lg pt-2">
          <span>Total</span>
          <span>{inr(total)}</span>
        </div>
      </div>

      {/* Pay Now */}
      <button
        onClick={createOrder}
        className="w-full bg-brand text-white py-3 rounded-lg shadow hover:shadow-md"
      >
        Pay Now
      </button>
    </div>
  )
}
