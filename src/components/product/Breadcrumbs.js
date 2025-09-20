"use client"

import Link from "next/link"
import { HomeIcon, ChevronRightIcon, CubeIcon } from "@heroicons/react/24/outline"

export default function Breadcrumbs({ product }) {
  if (!product) return null

  return (
    <div className="w-full border-b border-neutral-200 bg-[#FDFBED]">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center text-sm text-neutral-700 gap-2 overflow-x-auto">
        {/* Home */}
        <Link href="/" className="flex items-center gap-1 hover:text-[#003D3A]">
          <HomeIcon className="h-4 w-4" />
          Home
        </Link>

        <ChevronRightIcon className="h-4 w-4 text-neutral-400" />

        {/* Category */}
        {product.categoryName ? (
          <Link
            href={`/category/${product.categoryId}`}
            className="flex items-center gap-1 hover:text-[#003D3A]"
          >
            <CubeIcon className="h-4 w-4" />
            {product.categoryName}
          </Link>
        ) : (
          <span className="flex items-center gap-1 text-neutral-500">
            <CubeIcon className="h-4 w-4" />
            Category
          </span>
        )}

        <ChevronRightIcon className="h-4 w-4 text-neutral-400" />

        {/* Product */}
        <span className="truncate max-w-[160px] text-neutral-900 font-medium">
          {product.title}
        </span>
      </div>
    </div>
  )
}
