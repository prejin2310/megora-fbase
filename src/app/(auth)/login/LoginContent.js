"use client"

import { useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AuthPageLayout } from "@/components/auth/AuthPageLayout"

export default function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [pendingUser, setPendingUser] = useState(null)
  const [authCode, setAuthCode] = useState("")
  const [error, setError] = useState("")

  const handleAuthenticated = useCallback(
    async (user) => {
      try {
        const redirectParam = searchParams?.get("redirect")
        let destination = redirectParam || "/"

        const snapshot = await getDoc(doc(db, "users", user.uid))
        if (snapshot.exists() && snapshot.data()?.role === "admin") {
          // Save user temporarily and open auth modal
          setPendingUser(user)
          setShowAdminModal(true)
          return // wait for modal choice
        }

        router.push(destination)
      } catch (error) {
        console.error("auth:login-redirect", error)
        router.push("/")
      }
    },
    [router, searchParams]
  )

  const verifyAdminCode = () => {
    if (authCode !== "Meghna567#") {
      setError("Invalid Admin Auth Code")
      return
    }
    // Once verified, ask where to go
    const goToAdmin = window.confirm(
      "Login successful as Admin. Do you want to go to Admin Dashboard?"
    )
    router.push(goToAdmin ? "/admin" : "/")
    setShowAdminModal(false)
    setPendingUser(null)
    setAuthCode("")
    setError("")
  }

  return (
    <>
      <AuthPageLayout
        heading="Welcome back"
        subheading="Access your orders, curated wishlist, and concierge perks."
        asideCaption="Celebrate every milestone with handcrafted jewels delivered with care."
        onAuthenticated={handleAuthenticated}
        redirect={{
          message: "New to Megora?",
          href: "/signup",
          linkLabel: "Create an account",
        }}
      />

      {/* Admin Auth Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-[90%] max-w-sm">
            <h2 className="text-lg font-semibold text-brand mb-4">
              Admin Authentication
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Enter the secure admin auth code:
            </p>
            <input
              type="password"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="Enter Auth Code"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-3"
            />
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <button
              onClick={verifyAdminCode}
              className="w-full bg-brand text-white py-2 rounded-lg hover:bg-brand/90"
            >
              Verify & Continue
            </button>
          </div>
        </div>
      )}
    </>
  )
}
