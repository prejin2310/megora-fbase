"use client"

import {
  TruckIcon,
  GlobeAltIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline"

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-emerald-50 pt-40 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand mb-4">Shipping Policy</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            At <span className="font-semibold">Megora Jewels</span>, we strive to deliver your
            jewelry with care, speed, and transparency. Here’s everything you need to know about our
            shipping process.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {/* Free Shipping */}
          <div className="flex gap-5 items-start">
            <div className="flex-shrink-0 rounded-full bg-brand/10 p-3">
              <CurrencyRupeeIcon className="h-7 w-7 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Free Shipping</h2>
              <p className="text-sm text-gray-600 mt-1">
                Orders above <span className="font-medium">₹999</span> qualify for{" "}
                <span className="font-medium">Free Standard Shipping</span>. Applies to both single
                products and total cart value.
              </p>
            </div>
          </div>

          {/* Kerala */}
          <div className="flex gap-5 items-start">
            <div className="flex-shrink-0 rounded-full bg-brand/10 p-3">
              <TruckIcon className="h-7 w-7 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Within Kerala</h2>
              <p className="text-sm text-gray-600 mt-1">
                Delivery charge: <span className="font-medium">₹50</span>. Orders delivered within{" "}
                <span className="font-medium">3–5 business days</span>.
              </p>
            </div>
          </div>

          {/* Outside Kerala */}
          <div className="flex gap-5 items-start">
            <div className="flex-shrink-0 rounded-full bg-brand/10 p-3">
              <TruckIcon className="h-7 w-7 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Outside Kerala</h2>
              <p className="text-sm text-gray-600 mt-1">
                Delivery charges:{" "}
                <span className="font-medium">₹100–₹150</span> depending on location. Orders reach
                you in <span className="font-medium">5–10 business days</span>.
              </p>
            </div>
          </div>

          {/* Worldwide */}
          <div className="flex gap-5 items-start">
            <div className="flex-shrink-0 rounded-full bg-brand/10 p-3">
              <GlobeAltIcon className="h-7 w-7 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Worldwide Shipping</h2>
              <p className="text-sm text-gray-600 mt-1">
                We offer <span className="font-medium">Standard and Express options</span> worldwide.
                Charges vary based on your country and location.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Currently, our payment gateway supports only Indian region. International orders are
                accepted via{" "}
                <a
                  href="https://wa.me/917736166728?text=Hello%20Megora%20Jewels,%20I%20would%20like%20to%20place%20an%20International%20Order"
                  target="_blank"
                  className="text-brand underline"
                >
                  WhatsApp
                </a>{" "}
                or{" "}
                <a
                  href="https://instagram.com/megora_jewels"
                  target="_blank"
                  className="text-brand underline"
                >
                  Instagram
                </a>
                .
              </p>
            </div>
          </div>

          {/* Pre-Book Orders */}
          <div className="flex gap-5 items-start">
            <div className="flex-shrink-0 rounded-full bg-brand/10 p-3">
              <ChatBubbleLeftRightIcon className="h-7 w-7 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Pre-Book Orders</h2>
              <p className="text-sm text-gray-600 mt-1">
                For <span className="font-medium">Pre-Book orders</span>, delivery charges will be
                based on product/vendor availability. Orders can only be placed via our{" "}
                <span className="font-medium">Website or Instagram</span>. Please contact our{" "}
                <span className="font-medium">Store Manager</span> for assistance. Processing depends
                on vendor stock confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Extra Info */}
        <div className="mt-14 p-6 rounded-xl bg-white shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Additional Information
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
            <li>
              Orders are processed within{" "}
              <span className="font-medium">24–48 hours</span> of confirmation.
            </li>
            <li>
              Delays may occur during festive seasons, sales, or due to courier
              disruptions.
            </li>
            <li>
              Tracking details will be shared once your order is dispatched.
            </li>
            <li>
              For shipping assistance, contact us via{" "}
              <a
                href="mailto:megorajewels@gmail.com"
                className="text-brand underline"
              >
                megorajewels@gmail.com
              </a>{" "}
              or{" "}
              <a
                href="https://wa.me/917736166728?text=Hello%20Megora%20Jewels,%20I%20have%20a%20shipping%20related%20query"
                target="_blank"
                className="text-brand underline"
              >
                WhatsApp
              </a>
              .
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
