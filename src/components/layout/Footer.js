"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline"

const quickLinks = [
  { label: "Shop all", href: "/product" },
  { label: "New arrivals", href: "/#new-arrivals" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
  { label: "About us", href: "/about" },
  { label: "Contact us", href: "/contact" },
]

const supportLinks = [
  { label: "Track orders", href: "/orders" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Cancellation Policy", href: "/cancellation-policy" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
]

export default function Footer() {
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="relative overflow-hidden bg-brand text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_60%)]" />
      <div className="absolute inset-0 opacity-15">
        <Image src="/wPattern.svg" alt="pattern" fill className="object-cover" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1.1fr]">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logoLan.png" alt="Megora Jewels" width={140} height={60} className="object-contain" />
            </Link>
            <p className="text-sm text-white/70">
              Handcrafted elegance for every occasion Megora Jewels brings you exquisite designs for timeless beauty.
            </p>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <MapPinIcon className="h-5 w-5" />
              <span>Heera Bluebells, Vellayambalam, Trivandrum, Kerala</span>
            </div>
          </div>

          <FooterColumn heading="Browse" links={quickLinks} />
          <FooterColumn heading="Support" links={supportLinks} />

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Stay in touch</h3>
            <p className="text-sm text-white/70">
              Join the atelier list for early access to drops, styling notes, and private previews.
            </p>
            <form className="flex w-full items-center overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
              <input
                type="email"
                name="newsletter"
                placeholder="Enter your email"
                className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 hover:text-white"
              >
                Join
              </button>
            </form>
            <div className="space-y-3 text-sm text-white/70">
              <a href="mailto:megorajewels@gmail.com" className="flex items-center gap-2 hover:text-white">
                <EnvelopeIcon className="h-5 w-5" />
                megorajewels@gmail.com
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-white">
                <PhoneIcon className="h-5 w-5" />
                +91 77361 66728
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>Copyright {year} Megora Jewels.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/cancellation-policy" className="hover:underline">Cancellation</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ heading, links }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">{heading}</h3>
      <ul className="space-y-3 text-sm text-white/70">
        {links?.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

