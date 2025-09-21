"use client"

import {
  ArrowPathIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline"
import clsx from "clsx"

import { sanitizePhone } from "./utils"

const MODE_TABS = [
  { id: "login", label: "Sign in" },
  { id: "register", label: "Join Megora" },
]

const METHOD_TABS = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
]

export function AuthFormContent({state,actions,recaptchaId,layout = "sheet",showHeading = true}) {
  const {
    mode,
    method,
    email,
    password,
    confirmPassword,
    fullName,
    phone,
    otp,
    loading,
    otpLoading,
    otpSent,
    headline,
  } = state

  const {
    setMode,
    setMethod,
    setEmail,
    setPassword,
    setConfirmPassword,
    setFullName,
    setPhone,
    setOtp,
    handleEmailSubmit,
    handleSendOtp,
    phoneFormHandler,
  } = actions

  return (
    <div className={clsx(layout === "page" ? "w-full max-w-md" : undefined)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{headline}</h2>
          <p className="mt-1 text-sm text-gray-500">A single sign-in unlocks orders, wishlist, and concierge support.</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2 rounded-full border border-gray-100 bg-gray-50 p-1 text-sm font-medium">
        {MODE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={clsx(
              "flex-1 rounded-full px-3 py-2 transition",
              mode === tab.id ? "bg-brand text-white shadow" : "text-gray-500"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2 rounded-full border border-gray-100 bg-gray-50 p-1 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
        {METHOD_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMethod(tab.id)}
            className={clsx(
              "flex-1 rounded-full px-3 py-2 transition",
              method === tab.id ? "bg-white text-brand shadow" : "text-gray-400"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {method === "email" ? (
        <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <UserPlusIcon className="h-4 w-4" /> Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Prisha Kapoor"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <EnvelopeIcon className="h-4 w-4" /> Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LockClosedIcon className="h-4 w-4" /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
          </div>
          {mode === "register" && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <LockClosedIcon className="h-4 w-4" /> Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm Password"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Please wait!" : mode === "login" ? "Continue" : "Create account"}
          </button>
          <p className="text-xs text-gray-500">
            By continuing you agree to Megora's privacy policy and bespoke concierge terms.
          </p>
        </form>
      ) : (
        <form onSubmit={phoneFormHandler} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <PhoneIcon className="h-4 w-4" /> Mobile number
            </label>
            <div className="flex items-center gap-2">
              <span className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(sanitizePhone(event.target.value))}
                placeholder="98765 43210"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
                maxLength={10}
                required
              />
            </div>
          </div>
          {otpSent && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <LockClosedIcon className="h-4 w-4" /> OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="6-digit code"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
                maxLength={6}
                required
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || otpLoading}
              className="flex-1 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? "Verifying"
                : otpSent
                ? "Verify & continue"
                : otpLoading
                ? "Sending OTP"
                : "Send OTP"}
            </button>
            {otpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpLoading}
                className="inline-flex items-center gap-2 rounded-full border border-brand/20 px-4 py-3 text-sm font-medium text-brand hover:bg-brand/10 disabled:opacity-60"
              >
                <ArrowPathIcon className={clsx("h-4 w-4", otpLoading && "animate-spin")} />
                Resend
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            We'll verify your mobile via OTP. Your details stay private and secure.
          </p>
        </form>
      )}

      <div id={recaptchaId} className="hidden" />
    </div>
  )
}

