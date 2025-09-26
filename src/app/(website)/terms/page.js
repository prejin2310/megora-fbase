"use client"

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-40 px-4 bg-gradient-to-b from-amber-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-3xl font-bold text-brand mb-4">Terms & Conditions</h1>
        <p className="text-gray-700 mb-4">These are sample terms and conditions. Replace with your complete terms relevant to sales, returns, and use of the website.</p>
        <ul className="list-disc pl-6 text-gray-600">
          <li>All purchases subject to availability.</li>
          <li>Prices and offers may change without notice.</li>
          <li>Refer to cancellation & return policy for refunds.</li>
        </ul>
      </div>
    </div>
  )
}
