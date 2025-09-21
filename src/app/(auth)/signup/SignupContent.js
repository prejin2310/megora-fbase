"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"

import { AuthPageLayout } from "@/components/auth/AuthPageLayout"
import { db } from "@/lib/firebase"

export default function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleAuthenticated = useCallback(
    async (user) => {
      try {
        const redirectParam = searchParams?.get("redirect")
        let destination = redirectParam || "/"

        // If no redirect param, check role
        if (!redirectParam) {
          const snapshot = await getDoc(doc(db, "users", user.uid))
          if (snapshot.exists() && snapshot.data()?.role === "admin") {
            destination = "/admin"
          }
        }

        router.push(destination)
      } catch (error) {
        console.error("auth:signup-redirect", error)
        router.push("/")
      }
    },
    [router, searchParams]
  )

  return (
    <AuthPageLayout
      defaultMode="register"
      heading="Join Megora"
      subheading="Create your account to enjoy bespoke launches, faster checkout, and concierge care."
      asideCaption="Every heirloom is accompanied by lifetime care and a dedicated stylist."
      onAuthenticated={handleAuthenticated}
      redirect={{
        message: "Already have an account?",
        href: "/login",
        linkLabel: "Sign in",
      }}
    />
  )
}
