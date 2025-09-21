"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"

import { AuthFormContent } from "./AuthFormContent"
import { useAuthGateway } from "./useAuthGateway"

export default function AuthSheet({ open, onClose, onAuthenticated }) {
  const gateway = useAuthGateway({ open, onAuthenticated, recaptchaId: "auth-sheet-recaptcha" })

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[80]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-x-0 bottom-0 flex w-full justify-center p-4 sm:p-8">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <Dialog.Title className="text-base font-semibold text-gray-900">
                  Megora Access
                </Dialog.Title>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-gray-700"
                  aria-label="Close authentication"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <path
                      d="M2 2l10 10m0-10L2 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="px-6 pb-6 pt-4">
  <AuthFormContent
    state={gateway.state}
    actions={gateway.actions}
    recaptchaId={gateway.helpers.recaptchaId}
    showHeading={false}
  />
</div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}


