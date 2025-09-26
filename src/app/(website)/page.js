"use client"

import { useEffect, useState } from "react"

// import HeroBanner from "@/components/home/HeroBanner"
// import NewArrivals from "@/components/home/NewArrivals"
import NecklacesSection from "@/components/home/NecklacesSection"
import DealOfDay from "@/components/home/DealOfDay"
import FeatureHighlights from "@/components/home/FeatureHighlights"
import VideoSpotlight from "@/components/home/VideoSpotlight"
import Categories from "@/components/home/Categories"
import Reviews from "@/components/home/Reviews"
import HeroBannerDiwali from "@/components/home/HeroBannerDiwali"
import DiwaliSaleSection from "@/components/home/DiwaliSaleSection"

const LOADER_DELAY = 650

export default function HomePage() {
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const timeout = window.setTimeout(() => setInitializing(false), LOADER_DELAY)
    return () => window.clearTimeout(timeout)
  }, [])

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white/50 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4 text-brand">
          <span className="inline-flex h-14 w-14 animate-spin items-center justify-center rounded-full border-4 border-brand/10 border-t-brand" />
          <p className="text-sm uppercase tracking-[0.4em] text-brand/70">Megora</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white text-gray-900">
      {/* <HeroBanner /> */}
      <HeroBannerDiwali/>
      {/* <NewArrivals /> */}
      <DiwaliSaleSection />
      <NecklacesSection />
      <Categories />
      <DealOfDay />
      <VideoSpotlight />
      <Reviews />
    </div>
  )
}
