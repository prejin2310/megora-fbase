"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Loader from "@/components/layout/Loader"

export default function WebsiteLayout({ children }) {
  return (
    <>
      <Loader />
      <Navbar />
      <main className="pt-32">{children}</main>
      <Footer />
    </>
  )
}
