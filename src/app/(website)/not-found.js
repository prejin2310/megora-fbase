import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-center px-6">
      {/* Decorative jewelry icon */}
      <div className="text-6xl mb-4">💍</div>

      {/* Main message */}
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Page Not Found
      </h1>
      <p className="text-gray-600 max-w-md mb-6">
        The sparkle you’re looking for doesn’t exist here.  
        Maybe it was moved, or you mistyped the link.
      </p>

      {/* CTA buttons */}
      <div className="flex space-x-4">
        <Link
          href="/"
          className="px-6 py-3 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark"
        >
          Back to Home
        </Link>
        <Link
          href="/products"
          className="px-6 py-3 rounded-md border border-brand text-brand font-semibold hover:bg-brand hover:text-white"
        >
          Shop Jewelry
        </Link>
      </div>
    </div>
  );
}
