"use client"

import { useState } from "react"

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-medium">{title}</span>
        <span className="text-xl">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="pb-5 text-[15px] leading-relaxed">{children}</div>}
    </div>
  )
}

export default function ProductTabs({ product }) {
  const description =
    product?.description?.trim() ||
    "A premium handcrafted design made for those who love timeless elegance. Perfect for festive wear or daily chic styling."

  const careText =
    product?.attributes?.care?.trim() ||
    "Store in a dry, airtight box. Avoid contact with perfumes, water, and chemicals. Wipe gently with a soft cloth after every use."

  // Fancy FAQ set
  const defaultFaq = [
    {
      q: "Can I style this for both traditional and modern outfits?",
      a: "Absolutely! This piece is versatile enough to complement ethnic attire as well as contemporary looks.",
    },
    {
      q: "Is this lightweight for long wear?",
      a: "Yes, it is designed to be comfortable so you can wear it all day without any discomfort.",
    },
    {
      q: "Will it come with premium packaging?",
      a: "Yes, all our products are shipped in exclusive Megora packaging, perfect for gifting.",
    },
    {
      q: "Can I return or exchange if it doesn’t suit me?",
      a: "We offer hassle-free returns and exchanges within 7 days of delivery. Terms apply.",
    },
    {
      q: "Does this make a good gift?",
      a: "Definitely! It’s a thoughtful choice for birthdays, weddings, and festive occasions.",
    },
  ]

  const faqs = Array.isArray(product?.faq) && product.faq.length > 0 ? product.faq : defaultFaq

  return (
    <div className="mt-12 rounded-2xl bg-[#FDFBED] p-6 md:p-8">
      <Accordion title="Description" defaultOpen>
        <p>{description}</p>
      </Accordion>

      <Accordion title="Material & Care">
        <p>{careText}</p>
      </Accordion>

      <Accordion title="FAQ">
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i}>
              <div className="font-medium">{f.q}</div>
              <div className="text-[15px] text-neutral-700">{f.a}</div>
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  )
}
