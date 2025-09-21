"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRightIcon,
  EnvelopeIcon,
  GiftIcon,
  HeartIcon,
  MapPinIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

const quickActions = [
  {
    name: "Orders",
    href: "/orders",
    description: "Track purchases, download invoices, and manage returns.",
    icon: ShoppingBagIcon,
  },
  {
    name: "Wishlist",
    href: "/wishlist",
    description: "Revisit the pieces you loved and add them to your cart.",
    icon: HeartIcon,
  },
  {
    name: "Rewards",
    href: "/profile/rewards",
    description: "Unlock exclusive perks crafted for our loyal patrons.",
    icon: GiftIcon,
  },
]

export default function ProfilePage() {
  const { user, initializing } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/login?redirect=/profile")
    }
  }, [initializing, user, router])

  const joinDate = useMemo(() => {
    if (!user?.metadata?.creationTime) return null
    const parsed = new Date(user.metadata.creationTime)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    })
  }, [user])

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-light via-white to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-brand">
          <div className="h-12 w-12 rounded-full border-2 border-brand/30 border-t-transparent animate-spin" aria-hidden="true" />
          <p className="text-sm uppercase tracking-[0.3em] text-brand/70">Preparing your suite</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-light via-white to-white flex items-center justify-center">
        <p className="text-sm text-brand/80">Redirecting you to a secure login&hellip;</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-light via-white to-white pb-16">
      <section className="relative isolate overflow-hidden bg-brand text-white">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-emerald-500/30 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-[-6rem] left-[-4rem] h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" aria-hidden="true" />
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:gap-16">
          <div className="relative flex items-center justify-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/20 shadow-2xl shadow-black/20">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || user.email || "Profile"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/10">
                  <UserCircleIcon className="h-20 w-20 text-white/70" />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs tracking-[0.35em] uppercase">
              <SparklesIcon className="h-4 w-4" />
              Inner Circle Member
            </div>
            <h1 className="text-3xl sm:text-4xl font-playfair font-semibold">Welcome back, {user.displayName || user.email?.split("@")[0] || "Connoisseur"}</h1>
            <p className="max-w-xl text-sm md:text-base text-white/80">
              Your personal atelier for handcrafted elegance. Discover tailored recommendations, manage your collections, and stay ahead of exclusive drops curated for you.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              {user.email && (
                <span className="inline-flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4" />
                  {user.email}
                </span>
              )}
              {joinDate && (
                <span className="inline-flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4" />
                  Member since {joinDate}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-20 max-w-6xl px-6 sm:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-brand/5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-brand/60">Order Spotlight</p>
            <p className="mt-4 text-3xl font-semibold text-brand">04</p>
            <p className="mt-2 text-sm text-gray-600">Orders in progress</p>
            <Link href="/orders" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand/80">
              Manage orders
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-brand/5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-brand/60">Wishlist</p>
            <p className="mt-4 text-3xl font-semibold text-brand">12</p>
            <p className="mt-2 text-sm text-gray-600">Pieces awaiting your signature</p>
            <Link href="/wishlist" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand/80">
              View wishlist
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-brand to-emerald-800 p-6 text-white shadow-xl shadow-brand/20">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Loyalty</p>
            <p className="mt-4 text-3xl font-semibold">1,240</p>
            <p className="mt-2 text-sm text-white/80">Royalty points available</p>
            <Link href="/profile/rewards" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-amber-100">
              Redeem rewards
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl space-y-10 px-6 sm:px-10">
        <div className="rounded-3xl bg-white/90 p-8 shadow-lg shadow-brand/5 backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-brand">Personal dossier</h2>
              <p className="mt-2 text-sm text-gray-600">Edit your personal details, communications, and social handles.</p>
            </div>
            <Link href="/profile/settings" className="inline-flex items-center gap-2 rounded-full border border-brand/20 px-4 py-2 text-sm font-medium text-brand hover:bg-brand/5">
              Refine details
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-brand/10 p-5">
              <dt className="text-xs uppercase tracking-[0.3em] text-brand/60">Primary email</dt>
              <dd className="mt-3 flex items-center gap-2 text-sm text-gray-800">
                <EnvelopeIcon className="h-4 w-4 text-brand" />
                {user.email || "Not set"}
              </dd>
            </div>
            <div className="rounded-2xl border border-brand/10 p-5">
              <dt className="text-xs uppercase tracking-[0.3em] text-brand/60">Preferred phone</dt>
              <dd className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                <span className="italic">Add your number to receive shipping alerts</span>
              </dd>
            </div>
            <div className="rounded-2xl border border-brand/10 p-5 sm:col-span-2">
              <dt className="text-xs uppercase tracking-[0.3em] text-brand/60">Signature address</dt>
              <dd className="mt-3 flex items-center gap-3 text-sm text-gray-400">
                <MapPinIcon className="h-5 w-5 text-brand/60" />
                Elevate your experience by saving a preferred delivery address.
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white/90 p-8 shadow-lg shadow-brand/5 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-brand">Curated shortcuts</h2>
              <SparklesIcon className="h-6 w-6 text-brand/60" />
            </div>
            <p className="mt-3 text-sm text-gray-600">Handy links to keep your journey effortless.</p>
            <div className="mt-6 space-y-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="group flex items-start gap-4 rounded-2xl border border-brand/10 bg-white/70 p-5 transition hover:border-brand/40 hover:bg-white"
                >
                  <action.icon className="mt-1 h-6 w-6 text-brand group-hover:text-brand/80" />
                  <div>
                    <p className="text-sm font-semibold text-brand">{action.name}</p>
                    <p className="mt-1 text-xs text-gray-600">{action.description}</p>
                  </div>
                  <ArrowRightIcon className="ml-auto h-4 w-4 text-brand/40 group-hover:text-brand" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-brand text-white p-8 shadow-xl shadow-brand/20">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em]">
              Exclusive
            </div>
            <h2 className="mt-4 text-2xl font-playfair font-semibold">Private styling invitation</h2>
            <p className="mt-3 text-sm text-white/80">
              Enjoy a complimentary styling session with our in-house curator. Discover bespoke combinations and bespoke engravings tailored to your aura.
            </p>
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-brand hover:bg-amber-100"
            >
              Reserve your slot
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
