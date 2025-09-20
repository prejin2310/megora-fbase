import { Suspense } from "react"
import CheckoutContent from "./CheckoutContent"

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading checkout…</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
