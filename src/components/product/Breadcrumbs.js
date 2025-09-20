"use client"

import Link from "next/link"
import {
  HomeIcon,
  ChevronRightIcon,
  CubeIcon,
} from "@heroicons/react/24/outline"

export default function Breadcrumbs({ product, loading = false, bgColor = "#FDFBED" }) {
  if (loading) {
    return (
      <nav
        className="w-full border-b border-neutral-100"
        style={{ backgroundColor: bgColor }}
        aria-label="Breadcrumb"
      >
        <ol className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm">
          <div className="h-4 w-16 rounded bg-neutral-200 animate-pulse" />
          <ChevronRightIcon className="h-4 w-4 text-gray-300" />
          <div className="h-4 w-20 rounded bg-neutral-200 animate-pulse" />
          <ChevronRightIcon className="h-4 w-4 text-gray-300" />
          <div className="h-4 w-32 rounded bg-neutral-200 animate-pulse" />
        </ol>
      </nav>
    )
  }

  if (!product) return null

  return (
    <nav
      className="w-full border-b border-neutral-100"
      style={{ backgroundColor: bgColor }}
      aria-label="Breadcrumb"
    >
      <ol className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-3 text-sm text-gray-600">
        {/* Home */}
        <li className="flex items-center">
          <Link href="/" className="flex items-center gap-1 hover:text-brand">
            <HomeIcon className="h-4 w-4" />
            Home
          </Link>
        </li>

        <ChevronRightIcon className="h-4 w-4 text-gray-400" />

        {/* Category */}
        {product.categoryName && product.categorySlug && (
          <>
            <li className="flex items-center">
              <Link
                href={`/category/${product.categorySlug}`}
                className="flex items-center gap-1 hover:text-brand"
              >
                <CubeIcon className="h-4 w-4" />
                {product.categoryName}
              </Link>
            </li>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          </>
        )}

        {/* Product */}
        <li className="truncate text-gray-900">{product.title}</li>
      </ol>
    </nav>
  )
}
