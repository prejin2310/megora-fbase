// src/components/home/Reviews.js
"use client"

const REVIEWS = [
  { name: "Ananya", text: "Lovely craftsmanship and safe for daily wear." },
  { name: "Neha", text: "Bridal combo looked premium in real life. Highly recommended." },
  { name: "Aisha", text: "Fast delivery and great packaging. AD stone set sparkles beautifully." },
]

export default function Reviews() {
  return (
    <section className="bg-brand-light py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <h2 className="mb-10 text-center font-playfair text-3xl font-bold text-brand">
          What Our Customers Say
        </h2>

        {/* Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className="relative rounded-xl bg-white shadow-lg border border-brand/10 p-6 hover:shadow-xl transition"
            >
              {/* Quote mark */}
              <span className="absolute -top-4 left-6 text-6xl font-serif text-brand/10">“</span>

              {/* Review text */}
              <p className="mt-4 text-sm text-gray-700 leading-relaxed">{r.text}</p>

              {/* Reviewer */}
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center font-semibold text-brand">
                  {r.name[0]}
                </div>
                <div>
                  <p className="font-medium text-brand">{r.name}</p>
                  <p className="text-xs text-gray-500">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
