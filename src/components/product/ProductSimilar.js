"use client"

import Link from "next/link"
import Image from "next/image"

const inr = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(n || 0))

export default function ProductSimilar({ related = [] }) {
  if (!related?.length) return null

  return (
    <div className="mt-12">
      <div className="mb-4 text-xl font-semibold">You may also like</div>

      {/* Mobile: horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-2 md:hidden">
        {related.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.handle}`}
            className="min-w-[180px] max-w-[180px] flex-shrink-0 rounded-2xl border transition hover:shadow-md"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-t-2xl bg-neutral-50">
              <Image
                src={p.images?.[0] || "/placeholder.png"}
                alt={p.title}
                width={300}
                height={400}
                className="h-full w-full object-cover transition duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="space-y-1 p-3">
              <div className="line-clamp-1 text-sm font-medium">{p.title}</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-[#001f1d]">
                  {inr(p.price)}
                </span>
                {p.fakePrice > p.price && (
                  <span className="text-xs text-neutral-500 line-through">
                    {inr(p.fakePrice)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden gap-6 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {related.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.handle}`}
            className="group rounded-2xl border transition hover:shadow-md"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-t-2xl bg-neutral-50">
              <Image
                src={p.images?.[0] || "/placeholder.png"}
                alt={p.title}
                width={400}
                height={500}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="space-y-1 p-4">
              <div className="line-clamp-1 font-medium">{p.title}</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-[#001f1d]">
                  {inr(p.price)}
                </span>
                {p.fakePrice > p.price && (
                  <span className="text-xs text-neutral-500 line-through">
                    {inr(p.fakePrice)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
