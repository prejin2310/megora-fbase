"use client"

import { TagIcon, GlobeAltIcon, ScaleIcon, CubeIcon } from "@heroicons/react/24/outline"

export default function ProductMeta({ product }) {
  if (!product) return null

  return (
    <div className="mt-8 border-t border-neutral-200 pt-6 text-sm text-neutral-700 space-y-3">
      {/* SKU */}
      {product.sku && (
        <div className="flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-neutral-500" />
          <span className="font-medium">SKU:</span> {product.sku}
        </div>
      )}

      {/* Category */}
      {product.categoryName && (
        <div className="flex items-center gap-2">
          <CubeIcon className="h-4 w-4 text-neutral-500" />
          <span className="font-medium">Category:</span> {product.categoryName}
        </div>
      )}

      {/* Origin */}
      {product.attributes?.countryOfOrigin && (
        <div className="flex items-center gap-2">
          <GlobeAltIcon className="h-4 w-4 text-neutral-500" />
          <span className="font-medium">Origin:</span>{" "}
          {product.attributes.countryOfOrigin}
        </div>
      )}

      {/* Weight */}
      {product.attributes?.weight && (
        <div className="flex items-center gap-2">
          <ScaleIcon className="h-4 w-4 text-neutral-500" />
          <span className="font-medium">Weight:</span> {product.attributes.weight}
        </div>
      )}
    </div>
  )
}
