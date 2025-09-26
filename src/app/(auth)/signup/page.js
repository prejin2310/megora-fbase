"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import toast from "react-hot-toast"
import PhoneAuth from "@/components/auth/PhoneAuth"
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline"

export default function SignupPage() {
  const router = useRouter()
  const [tab, setTab] = useState("phone") // default phone
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleEmailSignup = async () => {
    if (!name || !email || !password) return toast.error("All fields required")
    try {
      setLoading(true)
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, "users", cred.user.uid), {
        userId: cred.user.uid,
        name,
        email,
        role: "user",
        createdAt: new Date(),
      })
      // Send welcome email for gmail addresses via server API
      try {
        if (String(email).toLowerCase().endsWith("@gmail.com")) {
          await fetch("/api/send-welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name }),
          })
        }
      } catch (err) {
        console.error("welcome email error", err)
      }
      toast.success("Account created 🎉")
      router.push("/")
    } catch (err) {
      console.error("signup-email", err)
      toast.error(err.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50 via-white to-amber-50 animate-pulse-slow"></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-brand">Create Account</h1>
        <p className="text-sm text-gray-600 text-center">
          Start your journey with timeless jewels.
        </p>

        {/* Tabs */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setTab("phone")}
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              tab === "phone"
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Phone
          </button>
          <button
            onClick={() => setTab("email")}
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              tab === "email"
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Email
          </button>
        </div>

        {/* Phone signup */}
        {tab === "phone" && <PhoneAuth mode="signup" onSuccess={() => router.push("/")} />}

        {/* Email signup */}
        {tab === "email" && (
          <div className="space-y-3">
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
            <div className="flex items-center border rounded-md px-3 py-2">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full outline-none text-sm"
              />
            </div>
            <div className="flex items-center border rounded-md px-3 py-2">
              <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none text-sm"
              />
            </div>
            <button
              onClick={handleEmailSignup}
              disabled={loading}
              className="w-full bg-brand text-white py-2 rounded-md font-medium hover:bg-brand/90 disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create with Email"}
            </button>
          </div>
        )}

        {/* Links */}
        <p className="text-center text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-brand hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  )
}
