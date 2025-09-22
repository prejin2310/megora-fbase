"use client"

import { useState, useEffect, useRef } from "react"
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import toast from "react-hot-toast"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"

import { UserIcon } from "@heroicons/react/24/outline"

let recaptchaVerifier

export default function PhoneAuth({ mode = "login", onSuccess }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState(Array(6).fill(""))
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const otpRefs = useRef([])

  useEffect(() => {
    if (!recaptchaVerifier && typeof window !== "undefined") {
      recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      })
    }
  }, [])

  const sendOtp = async () => {
    if (mode === "signup" && !name.trim()) {
      toast.error("Please enter your name")
      return
    }
    if (!phone || phone.length < 8) {
      toast.error("Invalid phone number")
      return
    }

    try {
      setLoading(true)
      const formattedPhone = "+" + phone // react-phone-input-2 returns without "+"
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifier
      )
      window.confirmationResult = confirmation
      setOtpSent(true)
      toast.success("OTP sent successfully")
    } catch (err) {
      console.error("phone-otp-error", err)
      toast.error(err.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    const enteredOtp = otp.join("")
    if (enteredOtp.length !== 6) {
      toast.error("Please enter 6-digit OTP")
      return
    }

    try {
      setLoading(true)
      const result = await window.confirmationResult.confirm(enteredOtp)

      if (mode === "signup") {
        await setDoc(doc(db, "users", result.user.uid), {
          userId: result.user.uid,
          name,
          phone: "+" + phone,
          role: "user",
          createdAt: new Date(),
        })
      }

      toast.success("Verified successfully 🎉")
      if (onSuccess) onSuccess(result.user)
    } catch (err) {
      console.error("otp-verify-error", err)
      toast.error("Invalid OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (value, idx) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[idx] = value
    setOtp(newOtp)

    if (value && idx < 5) {
      otpRefs.current[idx + 1]?.focus()
    }
  }

  return (
    <div className="space-y-4">
      {/* Full Name (Signup only) */}
      {mode === "signup" && (
        <div className="flex items-center border rounded-md px-3 py-2">
          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>
      )}

      {/* Phone input with flag */}
      <PhoneInput
        country={"in"} // default +91 India
        value={phone}
        onChange={(val) => setPhone(val)}
        inputStyle={{ width: "100%", height: "42px" }}
        dropdownStyle={{ zIndex: 50 }}
        enableSearch={true}
      />

      <p className="text-xs text-gray-500">
        We don’t send promotional messages. Your number is safe with us.
      </p>

      {/* OTP Inputs */}
      {otpSent && (
        <div className="flex justify-between gap-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (otpRefs.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, idx)}
              className="w-10 h-12 text-center border rounded-md text-lg font-medium focus:ring-1 focus:ring-brand outline-none"
            />
          ))}
        </div>
      )}

      {!otpSent ? (
        <button
          onClick={sendOtp}
          disabled={loading}
          className="w-full bg-brand text-white py-2 rounded-md font-medium hover:bg-brand/90 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send OTP"}
        </button>
      ) : (
        <button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full bg-brand text-white py-2 rounded-md font-medium hover:bg-brand/90 disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify OTP"}
        </button>
      )}

      <div id="recaptcha-container"></div>
    </div>
  )
}
