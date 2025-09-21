// src/components/home/ReviewModal.js
"use client"

import { Dialog } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/solid"
import Image from "next/image"

export default function ReviewModal({ review, onClose }) {
  return (
    <Dialog
      open={!!review}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div className="relative max-w-lg w-full bg-white rounded-xl p-6 shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
        >
          <XMarkIcon className="h-5 w-5 text-gray-700" />
        </button>

        {/* Reviewer */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center font-semibold text-brand">
            {review.name[0]}
          </div>
          <div>
            <p className="font-medium text-brand">{review.name}</p>
            <p className="text-xs text-gray-500">Verified Buyer</p>
          </div>
        </div>

        {/* Order details */}
        <p className="text-xs text-gray-500 mb-2">
          Order: {review.orderId} â€¢ Date: {review.date}
        </p>

        {/* Text */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.text}</p>

        {/* Images */}
        {review.images?.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {review.images.map((img, i) => (
              <div key={i} className="relative w-full h-32 rounded-lg overflow-hidden">
                <Image
                  src={img}
                  alt={`Review image ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  )
}



