import { Suspense } from "react"
import SignupContent from "./SignupContent"

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-brand">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
            <p className="text-sm uppercase tracking-[0.3em]">Loading signup…</p>
          </div>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  )
}
