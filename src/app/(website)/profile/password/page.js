"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { sendPasswordResetEmail } from "firebase/auth"
import toast from "react-hot-toast"

import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"

export default function PasswordPage() {
  const { user, initializing } = useAuth() || {}
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/login?redirect=/profile/password")
    }
  }, [initializing, user, router])

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user?.email])

  const isEmailValid = useMemo(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email), [email])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email || !isEmailValid) {
      toast.error("Add a valid email address")
      return
    }

    try {
      setSending(true)
      await sendPasswordResetEmail(auth, email.trim())
      toast.success("Password reset email sent. Please check your inbox.")
    } catch (error) {
      console.error("profile:password", error)
      toast.error(error?.message || "We couldn't send that email right now. Try again shortly.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 pt-28">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <section className="rounded-3xl bg-white px-6 py-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Security</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">Password reset</h1>
          <p className="mt-2 text-sm text-gray-600">
            We&apos;ll email you a secure link to reset your Megora password.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-3xl bg-white px-6 py-8 shadow-sm">
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="password-email">
              Email address
            </label>
            <input
              id="password-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={sending || !isEmailValid}
            className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending reset link" : "Send reset link"}
          </button>

          <p className="text-xs text-gray-500">
            Didn&apos;t receive the email? Check your spam folder or contact care@megora.in
          </p>
        </form>
      </div>
    </div>
  )
}



