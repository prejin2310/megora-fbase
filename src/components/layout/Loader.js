"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function Loader() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time (2s), adjust if needed
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-md">
      <div className="flex flex-col items-center">
        {/* Logo with subtle pulse animation */}
        <Image
          src="/logo.png" // put your PNG logo here
          alt="Megora Jewels Loader"
          width={120}
          height={120}
          className="animate-pulse drop-shadow-lg"
        />
        {/* Premium loading text */}
        <p className="mt-4 text-lg font-semibold text-brand-green animate-fade">
          Loading...
        </p>
      </div>
    </div>
  )
}
