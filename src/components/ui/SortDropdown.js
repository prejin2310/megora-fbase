"use client"

import { Fragment } from "react"
import { Listbox, Transition } from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid"

export default function SortDropdown({ value, onChange, options = [] }) {
  const selected = options.find((o) => o.value === value) || options[0]

  return (
    <div className="w-48">
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg border border-brand/20 bg-white py-2 pl-3 pr-10 text-left text-sm text-brand-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-brand">
            <span className="block truncate">{selected?.label || "Sort"}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon className="h-4 w-4 text-brand-dark/60" aria-hidden />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {options.map((opt) => (
                <Listbox.Option
                  key={opt.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-brand/10 text-brand-dark' : 'text-brand-dark/80'}`
                  }
                  value={opt.value}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium text-brand-dark' : 'font-normal'}`}>
                        {opt.label}
                      </span>

                      {selected ? (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand">
                          <CheckIcon className="h-4 w-4" aria-hidden />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}
