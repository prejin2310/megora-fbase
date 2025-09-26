"use client"

import {
  ArrowPathIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline"

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-emerald-50 pt-40 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <h1 className="text-4xl font-bold text-brand mb-6 text-center">
          Return & Exchange Policy
        </h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          At <span className="font-semibold">Megora Jewels</span>, we stand by the quality of our
          products. In rare cases you are not satisfied, we offer a smooth return process with
          clear guidelines to ensure a hassle-free experience.
        </p>

        {/* Policy Sections */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Return Window */}
          <div className="flex items-start gap-4 p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition">
            <ArrowPathIcon className="h-8 w-8 text-brand flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Return Request Timeline</h2>
              <p className="text-gray-600 text-sm mt-1">
                A return request must be initiated within{" "}
                <span className="font-medium">24 hours of delivery</span>. Requests can be placed
                through <span className="font-medium">WhatsApp or Email</span>.
              </p>
            </div>
          </div>

          {/* Proof Required */}
          <div className="flex items-start gap-4 p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition">
            <ShieldCheckIcon className="h-8 w-8 text-brand flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Proof of Unboxing</h2>
              <p className="text-gray-600 text-sm mt-1">
                A <span className="font-medium">clear unboxing video</span> is mandatory to claim a
                return. Once verified, we will approve and initiate the process.
              </p>
            </div>
          </div>

          {/* Condition */}
          <div className="flex items-start gap-4 p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition">
            <ExclamationTriangleIcon className="h-8 w-8 text-brand flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Original Condition Required</h2>
              <p className="text-gray-600 text-sm mt-1">
                Items must be returned in their{" "}
                <span className="font-medium">
                  original condition, box, pouch, tags, and any freebies
                </span>{" "}
                included. Products that are{" "}
                <span className="font-medium">worn, damaged, or used</span> will not be eligible.
              </p>
            </div>
          </div>

          {/* Refunds */}
          <div className="flex items-start gap-4 p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition">
            <CurrencyRupeeIcon className="h-8 w-8 text-brand flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Refund & Exchange</h2>
              <p className="text-gray-600 text-sm mt-1">
                Approved returns will be refunded within{" "}
                <span className="font-medium">5–7 business days</span> to your original payment
                method. You can also opt for an{" "}
                <span className="font-medium">exchange or store credit</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="mt-12 p-6 rounded-xl bg-white shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Non-Returnable Items</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Customized or engraved jewelry</li>
            <li>Gift cards or sale items</li>
            <li>Products returned without unboxing video proof</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Need Help?</h2>
          <p className="text-gray-600 text-sm">
            For return assistance, contact us via{" "}
            <a
              href="mailto:megorajewels@gmail.com"
              className="text-brand underline"
            >
              megorajewels@gmail.com
            </a>{" "}
            or WhatsApp at{" "}
            <a
              href="https://wa.me/917736166728?text=Hello%20Megora%20Jewels,%20I%20would%20like%20to%20initiate%20a%20Return%20Request"
              target="_blank"
              className="text-brand underline"
            >
              +91 77361 66728
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
