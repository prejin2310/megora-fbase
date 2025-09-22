"use client"

import { useState } from "react"
import { ShieldCheckIcon, UsersIcon, CurrencyRupeeIcon,MapPinIcon } from "@heroicons/react/24/outline"

const whyMegoraHighlights = [
  {
    title: "Premium Quality",
    description: "Quality you can see and feel.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Affordable Luxury",
    description: "Timeless designs at prices that fit your budget.",
    icon: CurrencyRupeeIcon,
  },
   {
    title: "Exclusive live Tracking",
    description: "Updates sent directly to you.",
    icon: MapPinIcon,
  },
  {
    title: "Trusted by Many",
    description: "Loved by thousands of happy customers.",
    icon: UsersIcon,
  },
]

const studioStats = [
  { label: "Handcraft hours", value: "38+" },
  { label: "Quality touchpoints", value: "42" },
]

export default function VideoSpotlight({
  poster = "/loginBanner.png",
  videoSrc = "/video1.mp4",
  heading = "Premium touches that make every order unforgettable.",
  description = " ",
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F8FFF9] via-white to-[#EEF7F4] py-20">
      <div className="pointer-events-none absolute left-[-160px] top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] bottom-10 h-64 w-64 rounded-full bg-brand/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-[40px] border border-brand/10 bg-white shadow-[0_40px_120px_-60px_rgba(6,56,48,0.45)]">
              <video
                className="h-full w-full"
                poster={poster}
                autoPlay
                muted
                loop
                controls
                playsInline
                preload="metadata"
                onLoadedData={() => setLoaded(true)}
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {!loaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-brand/10 via-white to-brand/10" />
              )}

              {/* <div className="absolute inset-x-6 bottom-6 flex flex-wrap gap-4 rounded-[28px] bg-white/85 p-5 backdrop-blur">
                {studioStats.map((stat) => (
                  <div key={stat.label} className="flex-1 min-w-[140px] text-center">
                    <p className="text-2xl font-semibold text-brand">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-brand/60">{stat.label}</p>
                  </div>
                ))}
              </div> */}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand/70">Why Megora</p>
              <h2 className="font-playfair text-3xl text-brand md:text-4xl">{heading}</h2>
              <p className="text-sm leading-relaxed text-gray-600">{description}</p>
            </div>

            <div className="space-y-4">
              {whyMegoraHighlights.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 rounded-3xl border border-brand/10 bg-white/90 p-5 shadow-[0_28px_70px_-55px_rgba(6,56,48,0.45)]"
                >
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-brand">{title}</p>
                    <p className="text-xs text-gray-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* <div className="rounded-3xl border border-brand/10 bg-white/90 p-6 text-sm text-gray-600 shadow-[0_28px_70px_-55px_rgba(6,56,48,0.35)]">
              <p>
                Want something custom? Email <span className="font-semibold text-brand">megorajewels@gmail.com</span> or WhatsApp
                <span className="font-semibold text-brand"> +91 77361 66728</span> to connect with our team.
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  )
}




