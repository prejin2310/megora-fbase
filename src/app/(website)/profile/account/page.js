"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { updateProfile } from "firebase/auth"
import toast from "react-hot-toast"

import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"

const initialForm = {
  name: "",
  phone: "",
}

const sanitizePhone = (value = "") => value.replace(/[^0-9]/g, "").slice(0, 10)

export default function AccountDetailsPage() {
  const { user, initializing } = useAuth() || {}
  const router = useRouter()

  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [loadingDoc, setLoadingDoc] = useState(true)

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/login?redirect=/profile/account")
    }
  }, [initializing, user, router])

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        setLoadingDoc(false)
        return
      }
      try {
        setLoadingDoc(true)
        const userRef = doc(db, "users", user.uid)
        const snapshot = await getDoc(userRef)
        const data = snapshot.exists() ? snapshot.data() : {}
        setForm({
          name: data.name || user.displayName || "",
          phone: data.phone || "",
        })
      } catch (error) {
        console.error("profile:account", error)
      } finally {
        setLoadingDoc(false)
      }
    }

    if (!initializing) {
      loadProfile()
    }
  }, [initializing, user?.displayName, user?.uid])

  const email = useMemo(() => user?.email || "", [user?.email])

  const handleChange = (field) => (event) => {
    const value = field === "phone" ? sanitizePhone(event.target.value) : event.target.value
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!user?.uid) return

    if (!form.name.trim()) {
      toast.error("Please add your full name.")
      return
    }

    try {
      setSaving(true)
      if (user.displayName !== form.name.trim()) {
        await updateProfile(user, { displayName: form.name.trim() })
      }

      const userRef = doc(db, "users", user.uid)
      await setDoc(
        userRef,
        {
          name: form.name.trim(),
          phone: form.phone || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      toast.success("Profile updated")
    } catch (error) {
      console.error("profile:account:update", error)
      toast.error(error?.message || "We could not save your details. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (initializing || loadingDoc) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-16 pt-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="h-48 animate-pulse rounded-3xl bg-white" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 pt-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <header className="rounded-3xl bg-white px-6 py-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Account</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">Account details</h1>
          <p className="mt-2 text-sm text-gray-600">
            Your name and phone number appear on invoices, delivery labels, and support interactions.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-3xl bg-white px-6 py-8 shadow-sm">
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="profile-name">
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              placeholder="Your full name"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="profile-email">
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              disabled
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
            />
            <p className="mt-2 text-xs text-gray-500">
              Need to change your email? Contact <a className="text-emerald-600" href="mailto:megorajewels@gmail.com">megorajewels@gmail.com</a> and we will assist you.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="profile-phone">
              Mobile number (optional)
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">+91</span>
              <input
                id="profile-phone"
                type="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="9876543210"
                maxLength={10}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving" : "Save changes"}
            </button>
            <p className="text-xs text-gray-500">Updates sync instantly across checkout, invoices, and support.</p>
          </div>
        </form>
      </div>
    </div>
  )
}



