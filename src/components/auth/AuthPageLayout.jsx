"use client"

import Image from "next/image"
import Link from "next/link"
import clsx from "clsx"

import { AuthFormContent } from "@/components/auth/AuthFormContent"
import { useAuthGateway } from "@/components/auth/useAuthGateway"

export function AuthPageLayout({
  defaultMode = "login",
  defaultMethod = "email",
  heading = "Welcome back",
  subheading = "Sign in to continue your Megora journey.",
  accentLabel = "Megora Insider",
  onAuthenticated,
  recaptchaId = "auth-page-recaptcha",
  asideImage = "/product3.jpg",
  asideCaption = "Crafted to glow with every occasion.",
  redirect,
}) {
  const gateway = useAuthGateway({
    open: true,
    onAuthenticated,
    recaptchaId,
    defaultMode,
    defaultMethod,
  })

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#fdf8f1] via-white to-[#ecf7f4]">
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-black/5 lg:flex">
        <Image
          src={asideImage}
          alt="Megora Muse"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-black/60" />
        <div className="relative z-10 max-w-sm space-y-4 px-10 py-12 text-white">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.35em]">
            {accentLabel}
          </span>
          <p className="text-3xl font-semibold leading-tight">{heading}</p>
          <p className="text-sm text-white/80">{asideCaption}</p>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur lg:max-w-lg">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-brand/70">Megora access</span>
            <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>
            <p className="text-sm text-gray-500">{subheading}</p>
          </div>

          <AuthFormContent
            state={gateway.state}
            actions={gateway.actions}
            recaptchaId={gateway.helpers.recaptchaId}
            layout="page"
          />

          {redirect && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-600">
              <span>{redirect.message}</span>
              <Link
                href={redirect.href}
                className={clsx(
                  "font-semibold text-brand transition hover:text-brand/80",
                  "underline-offset-4 hover:underline"
                )}
              >
                {redirect.linkLabel}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
