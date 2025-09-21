import { ShieldCheckIcon, ClockIcon, SparklesIcon, MapPinIcon } from "@heroicons/react/24/outline"

const highlightItems = [
  {
    title: "Premium quality jewellery",
    description: "Hallmarked metals, handset stones, and rigorous quality checks on every piece.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Dispatched within 24 hrs",
    description: "Orders are hand-packed by our atelier team and shipped with insured logistics partners.",
    icon: ClockIcon,
  },
  {
    title: "Affordable luxury",
    description: "Statement-making designs priced transparently so you can build your collection with ease.",
    icon: SparklesIcon,
  },
  {
    title: "Exclusive live tracking",
    description: "Follow your parcel in real time from our studio to your doorstep—updates sent directly to you.",
    icon: MapPinIcon,
  },
]

export default function FeatureHighlights() {
  return (
    <section className="bg-gradient-to-br from-white via-brand-light to-white py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand/70">
            Why Megora
          </p>
          <h2 className="mt-3 font-playfair text-3xl text-brand md:text-4xl">
            Premium touches that make every order unforgettable.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {highlightItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border border-brand/10 bg-white p-6 shadow-[0_26px_55px_-32px_rgba(0,61,58,0.35)] transition-transform hover:-translate-y-1"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-brand">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.description}</p>
              </div>
            )
          })}
        </div>
        <div className="rounded-3xl border border-brand/10 bg-white/90 p-6 text-sm text-gray-600 shadow-[0_24px_60px_-40px_rgba(0,61,58,0.35)]">
          <p>
            Need assistance? Email us at <span className="font-semibold text-brand">megorajewels@gmail.com</span> or send a WhatsApp message to <span className="font-semibold text-brand">+91 77361 66728</span> and our stylists will help you curate the perfect look.
          </p>
        </div>
      </div>
    </section>
  )
}
