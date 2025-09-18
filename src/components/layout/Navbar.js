"use client"

import { Fragment, useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react"
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  HeartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import Image from "next/image"
import { searchProducts } from "@/lib/db"

const navigation = {
  categories: [
    {
      id: "jewelry",
      name: "Jewelry",
      featured: [
        {
          name: "New Arrivals",
          href: "/products?filter=new",
          imageSrc: "/demo/new-arrivals.jpg",
          imageAlt: "New jewelry arrivals.",
        },
        {
          name: "Bridal Combo",
          href: "/products?filter=bridal",
          imageSrc: "/demo/bridal-combo.jpg",
          imageAlt: "Bridal combo collection.",
        },
      ],
      sections: [
        {
          id: "categories",
          name: "Categories",
          items: [
            { name: "Anti Tarnish", href: "/category/anti-tarnish" },
            { name: "Necklace", href: "/category/necklaces" },
            { name: "AD Stone", href: "/category/ad-stone" },
            { name: "Harams", href: "/category/harams" },
            { name: "Bridal Combo", href: "/category/bridal-combo" },
          ],
        },
      ],
    },
  ],
}

// ✅ Helper
function getPrice(product, currency) {
  const price = product?.prices?.[currency] || null
  return price ? price : null
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [currency, setCurrency] = useState("INR")
  const [mobileSearch, setMobileSearch] = useState(false)
  const [desktopSearch, setDesktopSearch] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const searchInputRef = useRef(null)

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7) // transparent only on hero
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length > 1) {
        try {
          const products = await searchProducts(query)
          setResults(products)
          setShowResults(true)
        } catch (err) {
          console.error("Search failed:", err)
        }
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 400)
    return () => clearTimeout(delayDebounce)
  }, [query])

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "INR" ? "USD" : "INR"))
  }

  return (
    <div>
      {/* Sidebar (mobile) */}
      <Dialog open={open} onClose={setOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop className="fixed inset-0 bg-black/25" />
        <div className="fixed inset-0 z-50 flex">
          <DialogPanel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
            {/* Close */}
            <div className="flex px-4 pt-5 pb-2 justify-end">
              <button onClick={() => setOpen(false)} className="p-2 text-gray-400">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Categories */}
            <TabGroup className="mt-2">
              <div className="border-b border-gray-200">
                <TabList className="-mb-px flex space-x-8 px-4">
                  {navigation.categories.map((category) => (
                    <Tab
                      key={category.name}
                      className="flex-1 border-b-2 border-transparent px-1 py-4 text-base font-medium text-gray-900 
                        data-selected:border-brand data-selected:text-brand"
                    >
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {navigation.categories.map((category) => (
                  <TabPanel key={category.name} className="space-y-10 px-4 pt-6 pb-8">
                    {/* Featured */}
                    <div className="grid grid-cols-2 gap-4">
                      {category.featured.map((item) => (
                        <div key={item.name} className="group text-sm">
                          <img
                            alt={item.imageAlt}
                            src={item.imageSrc}
                            className="aspect-square w-full rounded-lg object-cover group-hover:opacity-75"
                          />
                          <a href={item.href} className="mt-2 block font-medium text-gray-900">
                            {item.name}
                          </a>
                        </div>
                      ))}
                    </div>

                    {/* Sections */}
                    {category.sections.map((section) => (
                      <div key={section.name}>
                        <p className="font-medium text-gray-900">{section.name}</p>
                        <ul className="mt-4 flex flex-col space-y-2">
                          {section.items.map((item) => (
                            <li key={item.name}>
                              <a href={item.href} className="block text-gray-600 hover:text-brand">
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>

            {/* Currency */}
            <div className="border-t border-gray-200 px-4 py-6">
              <button onClick={toggleCurrency} className="flex items-center space-x-2 text-gray-800">
                <span className="text-base font-medium">{currency}</span>
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
          scrolled ? "bg-brand shadow-md" : "bg-transparent"
        }`}
      >
        {/* Shipping Bar */}
        <p
          className={`flex h-10 items-center justify-center px-4 text-sm font-medium ${
            scrolled ? "bg-white text-brand" : "bg-white/70 text-brand backdrop-blur-md"
          }`}
        >
          Free Shipping on All Orders Above ₹599
        </p>

        {/* Navbar */}
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Left */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-md p-2 text-white lg:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <Link href="/" className="ml-2 flex items-center">
                <Image src="/logoLan.png" alt="Megora" width={120} height={80} />
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-4">
              {/* Currency */}
              <div className="hidden lg:flex cursor-pointer" onClick={toggleCurrency}>
                <span className="ml-2 text-sm text-white">{currency}</span>
              </div>

              {/* Desktop search */}
              {!desktopSearch ? (
                <button className="hidden lg:block text-white" onClick={() => setDesktopSearch(true)}>
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </button>
              ) : (
                <div className="hidden lg:block relative w-80">
                  <div className="flex items-center rounded-full bg-white/90 px-4 py-2 shadow-md backdrop-blur-md">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search products by name or SKU..."
                      className="ml-2 w-full bg-transparent outline-none text-gray-700"
                    />
                    <button
                      onClick={() => {
                        setDesktopSearch(false)
                        setQuery("")
                        setShowResults(false)
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {showResults && (
                    <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg z-50 max-h-72 overflow-y-auto">
                      {results.length > 0 ? (
                        results.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 border-b"
                            onClick={() => setShowResults(false)}
                          >
                            <Image
                              src={product.thumbnail || "/demo/product1.jpg"}
                              alt={product.title}
                              width={40}
                              height={40}
                              className="rounded-md"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{product.title}</p>
                              <p className="text-xs text-gray-500">SKU: {product.sku || "N/A"}</p>
                              <p className="text-sm font-semibold text-brand">
                                {currency} {getPrice(product, currency) ?? "—"}
                              </p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">No products found</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mobile search */}
              <button className="lg:hidden text-white" onClick={() => setMobileSearch((p) => !p)}>
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist">
                <HeartIcon className="h-6 w-6 text-white hover:text-gray-200" />
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative flex items-center text-white">
                <ShoppingBagIcon className="h-6 w-6" />
                <span className="ml-1 text-sm">0</span>
              </Link>

              {/* Profile */}
              <Link href="/profile">
                <UserCircleIcon className="h-7 w-7 text-white hover:text-gray-200" />
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}
