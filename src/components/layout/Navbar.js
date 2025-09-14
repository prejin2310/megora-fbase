"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-brand">
          Megora<span className="text-gray-700">Jewels</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex space-x-6">
          <Link
            href="/products"
            className={`${
              pathname.startsWith("/products")
                ? "text-brand font-semibold"
                : "text-gray-700"
            } hover:text-brand`}
          >
            Shop
          </Link>
          <Link
            href="/wishlist"
            className={`${
              pathname === "/wishlist" ? "text-brand font-semibold" : "text-gray-700"
            } hover:text-brand`}
          >
            Wishlist
          </Link>
          <Link
            href="/cart"
            className={`${
              pathname === "/cart" ? "text-brand font-semibold" : "text-gray-700"
            } hover:text-brand`}
          >
            Cart
          </Link>
          <Link
            href="/profile"
            className={`${
              pathname === "/profile" ? "text-brand font-semibold" : "text-gray-700"
            } hover:text-brand`}
          >
            Profile
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-md border border-brand text-brand hover:bg-brand hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-md bg-brand text-white hover:bg-brand-dark"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
}
