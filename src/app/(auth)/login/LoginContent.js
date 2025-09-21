"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"

import { AuthPageLayout } from "@/components/auth/AuthPageLayout"
import { db } from "@/lib/firebase"

export default function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleAuthenticated = useCallback(
    async (user) => {
      try {
        const redirectParam = searchParams?.get("redirect")
        let destination = redirectParam || "/"

        if (!redirectParam) {
          const snapshot = await getDoc(doc(db, "users", user.uid))
          if (snapshot.exists() && snapshot.data()?.role === "admin") {
            destination = "/admin"
          }
        }

        router.push(destination)
      } catch (error) {
        console.error("auth:login-redirect", error)
        router.push("/")
      }
    },
    [router, searchParams]
  )

  return (
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
  )
}
