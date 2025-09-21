"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { arrayRemove, arrayUnion, doc, getDoc, setDoc } from "firebase/firestore"
import toast from "react-hot-toast"

import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"

const emptyAddress = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
}

const sanitizePhone = (value = "") => value.replace(/[^0-9]/g, "").slice(0, 10)
const sanitizePincode = (value = "") => value.replace(/[^0-9]/g, "").slice(0, 6)

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `addr_${Math.random().toString(36).slice(2, 10)}`
}

export default function SavedAddressesPage() {
  const { user, initializing } = useAuth() || {}
  const router = useRouter()

  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState(emptyAddress)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/login?redirect=/profile/addresses")
    }
  }, [initializing, user, router])

  useEffect(() => {
    const loadAddresses = async () => {
      if (!user?.uid) {
        setLoading(false)
        return
      }
      try {
        const userRef = doc(db, "users", user.uid)
        const snapshot = await getDoc(userRef)
        const data = snapshot.exists() ? snapshot.data() : {}
        setAddresses(data.addresses || [])
      } catch (error) {
        console.error("profile:addresses", error)
      } finally {
        setLoading(false)
      }
    }

    if (!initializing) {
      loadAddresses()
    }
  }, [initializing, user?.uid])

  const handleChange = (field) => (event) => {
    const value =
      field === "phone" ? sanitizePhone(event.target.value) : field === "pincode" ? sanitizePincode(event.target.value) : event.target.value
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!user?.uid) return

    const requiredFields = ["fullName", "line1", "city", "state", "pincode"]
    const missing = requiredFields.find((field) => !form[field].trim())
    if (missing) {
      toast.error("Please complete all required address fields.")
      return
    }
    if (form.pincode.length !== 6) {
      toast.error("Pincode must be 6 digits.")
      return
    }

    const entry = {
      id: createId(),
      ...form,
      line1: form.line1.trim(),
      line2: form.line2.trim() || "",
      fullName: form.fullName.trim(),
      label: form.label.trim() || "Home",
      createdAt: new Date().toISOString(),
    }

    try {
      setSaving(true)
      const userRef = doc(db, "users", user.uid)
      await setDoc(userRef, { addresses: arrayUnion(entry) }, { merge: true })
      setAddresses((previous) => [entry, ...previous])
      setForm(emptyAddress)
      toast.success("Address saved")
    } catch (error) {
      console.error("profile:addresses:add", error)
      toast.error("We couldn't save that address. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (address) => {
    if (!user?.uid) return
    try {
      const userRef = doc(db, "users", user.uid)
      await setDoc(userRef, { addresses: arrayRemove(address) }, { merge: true })
      setAddresses((previous) => previous.filter((item) => item.id !== address.id))
      toast.success("Address removed")
    } catch (error) {
      console.error("profile:addresses:remove", error)
      toast.error("We couldn't remove that address. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 pt-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <header className="rounded-3xl bg-white px-6 py-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Addresses</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">Saved addresses</h1>
          <p className="mt-2 text-sm text-gray-600">
            Keep your preferred delivery addresses ready for faster checkout and seamless gifting.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-3xl bg-white px-6 py-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Add new address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="address-label">Label</label>
              <input
                id="address-label"
                type="text"
                value={form.label}
                onChange={handleChange("label")}
                placeholder="Home / Office"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="address-name">Recipient name</label>
              <input
                id="address-name"
                type="text"
                value={form.fullName}
                onChange={handleChange("fullName")}
                placeholder="Name"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="address-phone">Phone (optional)</label>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">+91</span>
              <input
                id="address-phone"
                type="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="9876543210"
                maxLength={10}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="address-line1">Address line 1</label>
            <input
              id="address-line1"
              type="text"
              value={form.line1}
              onChange={handleChange("line1")}
              placeholder="Flat / House / Street"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="address-line2">Address line 2</label>
            <input
              id="address-line2"
              type="text"
              value={form.line2}
              onChange={handleChange("line2")}
              placeholder="Apartment, landmark (optional)"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="address-city">City</label>
              <input
                id="address-city"
                type="text"
                value={form.city}
                onChange={handleChange("city")}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="address-state">State</label>
              <input
                id="address-state"
                type="text"
                value={form.state}
                onChange={handleChange("state")}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="address-pincode">Pincode</label>
              <input
                id="address-pincode"
                type="text"
                value={form.pincode}
                onChange={handleChange("pincode")}
                inputMode="numeric"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving address" : "Save address"}
            </button>
            <p className="text-xs text-gray-500">Saved addresses are available during checkout for rapid delivery scheduling.</p>
          </div>
        </form>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Saved addresses</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <p className="rounded-3xl bg-white px-6 py-6 text-sm text-gray-600 shadow-sm">
              You have not saved an address yet. Add one above to speed up checkout.
            </p>
          ) : (
            <ul className="space-y-4">
              {addresses.map((address) => (
                <li key={address.id} className="rounded-3xl bg-white px-6 py-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{address.label}</p>
                      <p className="text-sm text-gray-700">{address.fullName}</p>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{address.line1}</p>
                        {address.line2 && <p>{address.line2}</p>}
                        <p>
                          {address.city}, {address.state} {address.pincode}
                        </p>
                        {address.phone && <p>+91 {address.phone}</p>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(address)}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-gray-600 transition hover:border-rose-200 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
