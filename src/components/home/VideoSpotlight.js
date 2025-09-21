"use client"

import { useState } from "react"

export default function VideoSpotlight({
  poster = "/loginBanner.png",
  videoSrc = "/video1.mp4",
  heading = "Inside the Megora atelier",
  description = "Take a slow tour of our polishing rooms, stone-setting lab, and packaging tables where every order is finished by hand.",
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-brand-light to-white py-16">
      <div className="absolute -right-[240px] top-[-120px] h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 md:flex-row md:items-center md:gap-12">
        <div className="md:w-[420px] space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand/70">
            Studio glimpse
          </p>
          <h2 className="font-playfair text-3xl text-brand md:text-4xl">{heading}</h2>
          <p className="text-sm leading-relaxed text-gray-600">{description}</p>
          <div className="grid gap-4 text-sm text-gray-600">
            <FeatureRow title="Handcrafted quality" detail="Every piece passes 42 touchpointsfrom casting and polishing to final hallmarking." />
            <FeatureRow title="Concierge packaging" detail="Luxe boxes, anti-tarnish pouches, and insured shipping on every order." />
          </div>
        </div>

        <div className="relative flex-1">
          <div className="relative overflow-hidden rounded-[36px] border border-brand/10 bg-brand-light/60 shadow-[0_32px_90px_-45px_rgba(0,61,58,0.4)]">
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
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureRow({ title = "", detail = "" }) {
  return (
    <div className="rounded-2xl border border-brand/10 bg-white/90 p-4 shadow-sm">
      <p className="text-sm font-semibold text-brand">{title}</p>
      <p className="mt-1 text-xs text-gray-600">{detail}</p>
    </div>
  )
}

