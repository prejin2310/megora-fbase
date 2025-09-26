"use client"

import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-40 px-4 bg-gradient-to-b from-amber-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-3xl font-bold text-brand mb-4">About Us</h1>
        <p className="text-gray-700 mb-4">
          Megora Jewels crafts handcrafted jewelry inspired by tradition and modern design. Our atelier focuses on
          quality, sustainability, and timeless pieces you’ll treasure. This is dummy content — replace with your
          real &quot;About&quot; copy.
        </p>
        <p className="text-gray-600">For collaborations or press, reach out via our contact page.</p>
      </div>
    </div>
  )
}
