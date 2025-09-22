"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
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

  // 🔹 Admin modal states
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [authCode, setAuthCode] = useState("")
  const [error, setError] = useState("")
  const [pendingUser, setPendingUser] = useState(null)

  const handleEmailLogin = async () => {
    try {
      setLoading(true)
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(db, "users", cred.user.uid))
      const role = userDoc.exists() ? userDoc.data().role : "user"

      toast.success("Welcome back 🎉")

      if (role === "admin") {
        setPendingUser(cred.user)
        setShowAdminModal(true) // show modal for auth code
      } else {
        router.push("/")
      }
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
        {tab === "phone" && (
          <PhoneAuth
            mode="login"
            onSuccess={(user) => {
              toast.success("Welcome back 🎉")
              router.push("/")
            }}
          />
        )}

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
          <a href="/signup" className="font-medium text-brand hover:underline">
            Create one
          </a>
        </p>
      </div>

      {/* 🔹 Admin Auth Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-[90%] max-w-sm">
            <h2 className="text-lg font-semibold text-brand mb-4">
              Admin Authentication
            </h2>
            <input
              type="password"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="Enter Auth Code"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-3"
            />
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (authCode !== "Meghna567#") {
                    setError("Invalid Admin Auth Code")
                    return
                  }
                  router.push("/admin")
                  setShowAdminModal(false)
                  setPendingUser(null)
                  setAuthCode("")
                  setError("")
                }}
                className="flex-1 bg-brand text-white py-2 rounded-lg hover:bg-brand/90"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  if (authCode !== "Meghna567#") {
                    setError("Invalid Admin Auth Code")
                    return
                  }
                  router.push("/")
                  setShowAdminModal(false)
                  setPendingUser(null)
                  setAuthCode("")
                  setError("")
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
