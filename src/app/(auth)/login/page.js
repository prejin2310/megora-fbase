"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import toast from "react-hot-toast"
import PhoneAuth from "@/components/auth/PhoneAuth"
import {
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline"

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState("phone") // default phone
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async () => {
    try {
      setLoading(true)
      const cred = await signInWithEmailAndPassword(auth, email, password)
      toast.success("Welcome back 🎉")
      router.push("/")
    } catch (err) {
      console.error("login-email", err)
      toast.error("Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50 via-white to-amber-50 animate-pulse-slow"></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-brand">Login</h1>
        <p className="text-sm text-gray-600 text-center">
          Access your orders, wishlist and more.
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

        {/* Phone login */}
        {tab === "phone" && <PhoneAuth mode="login" onSuccess={() => router.push("/")} />}

        {/* Email login */}
        {tab === "email" && (
          <div className="space-y-3">
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
              onClick={handleEmailLogin}
              disabled={loading}
              className="w-full bg-brand text-white py-2 rounded-md font-medium hover:bg-brand/90 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Login with Email"}
            </button>
          </div>
        )}

        {/* Links */}
        <p className="text-center text-sm mt-6">
          Don’t have an account?{" "}
          <a href="/auth/signup" className="font-medium text-brand hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}
