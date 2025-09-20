"use client"

import { useState } from "react"

export default function ProductDelivery() {
  const [pin, setPin] = useState("")
  const [deliveryMsg, setDeliveryMsg] = useState("")
  const [animate, setAnimate] = useState(false)

  const checkPin = (e) => {
    e.preventDefault()
    if (!pin || pin.length < 6) {
      setDeliveryMsg("Please enter a valid 6-digit pincode.")
      setAnimate(true)
      return
    }
    setDeliveryMsg("Estimated delivery: 3–7 days 🚚")
    setAnimate(true)
  }

  return (
    <div className="mt-8 max-w-md">
      <div className="text-sm font-medium text-neutral-800 mb-2">
        Check delivery availability
      </div>

      <form onSubmit={checkPin} className="flex gap-2">
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter pincode"
          className="flex-1 rounded-xl border border-neutral-300 px-4 py-2 outline-none focus:border-[#003D3A]"
        />
        <button
          type="submit"
          className="rounded-xl bg-[#003D3A] px-4 py-2 text-white transition hover:bg-[#002c2a]"
        >
          Check
        </button>
      </form>

      {deliveryMsg && (
        <div
          className={`mt-3 text-sm ${
            deliveryMsg.includes("Estimated")
              ? "text-emerald-700"
              : "text-rose-600"
          } transition-all duration-300 ${
            animate ? "animate-fadeIn" : ""
          }`}
          onAnimationEnd={() => setAnimate(false)}
        >
          {deliveryMsg}
        </div>
      )}
    </div>
  )
}
