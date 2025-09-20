"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export default function WebsiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>  
      <Footer />
    </>
  )
}
