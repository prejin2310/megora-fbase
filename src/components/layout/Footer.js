"use client"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { useState, useEffect } from "react"

export default function Footer() {

   const [year, setYear] = useState("")

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])


  return (
    <footer className="relative bg-brand-green text-brand-white">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/wPattern.svg"
          alt="pattern"
          fill
          className="object-cover"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo & Brand */}
          <div>
            <div className="flex items-center gap-x-2">
              <Image
                src="/logo.png"
                alt="Megora Jewels"
                width={50}
                height={50}
                className="rounded bg-white"
              />
              <span className="text-2xl font-cormorant font-bold">
                Megora Jewels
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-brand-light">
              Handcrafted elegance for every occasion — timeless beauty,
              delivered with care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products" className="hover:underline">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/category/rings" className="hover:underline">
                  Rings
                </Link>
              </li>
              <li>
                <Link href="/category/necklaces" className="hover:underline">
                  Necklaces
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:underline">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:underline">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/orders" className="hover:underline">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:underline">
                  Checkout
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:underline">
                  Account
                </Link>
              </li>
              <li>
                <a href="mailto:megorajewels@gmail.com" className="hover:underline">
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="/return-policy" className="hover:underline">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
            <form className="flex items-center bg-white rounded-md overflow-hidden">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm text-gray-700 outline-none"
              />
              <button
                type="submit"
                className="bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-black transition"
              >
                Subscribe
              </button>
            </form>
            <div className="flex space-x-4 mt-6">
              <a href="#" aria-label="Instagram" className="hover:text-brand-light">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-brand-light">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-brand-light">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-brand-light">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-brand-light/30 mt-10 pt-6 text-sm text-brand-light flex flex-col md:flex-row justify-between items-center">
        <p>© {year} Megora Jewels. All rights reserved.</p>
        <p>Heera Bluebells, Vellayambalam, Trivandrum, Kerala</p>
      </div>
      </div>
    </footer>
  )
}