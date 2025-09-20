"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import clsx from "clsx"

export default function ProductGallery({ images = [], title, variant }) {
  const [mainImg, setMainImg] = useState(images?.[0] || "/placeholder.png")

  // update gallery when variant changes
  useEffect(() => {
    if (variant?.images?.length) {
      setMainImg(variant.images[0])
    } else if (images?.length) {
      setMainImg(images[0])
    }
  }, [variant, images])

  const galleryImages = variant?.images?.length ? variant.images : images

  return (
    <div className="w-full grid md:grid-cols-[80px_1fr] gap-3">
      {/* Thumbnails (left on desktop / top scroll on mobile) */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[520px]">
        {galleryImages.map((img, i) => (
          <button
            key={i}
            onClick={() => setMainImg(img)}
            className={clsx(
              "relative aspect-square w-20 md:w-[70px] flex-shrink-0 overflow-hidden rounded-lg border transition",
              mainImg === img
                ? "border-[#003D3A] ring-2 ring-[#003D3A]"
                : "border-neutral-200 hover:border-neutral-400"
            )}
          >
            <Image
              src={img}
              alt={`${title} ${i + 1}`}
              fill
              className="object-cover"
              sizes="80px"
              loading="lazy"
              onError={(e) => (e.currentTarget.src = "/placeholder.png")}
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={mainImg}
          alt={title}
          fill
          priority
          className="object-cover transition-transform duration-500 ease-in-out hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={(e) => (e.currentTarget.src = "/placeholder.png")}
        />
      </div>
    </div>
  )
}
