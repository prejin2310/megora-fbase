import "@/app/globals.css"
import { Inter, Playfair_Display } from "next/font/google"
import Providers from "./providers"   // wrap contexts here

// Fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata = {
  title: "Megora Jewels",
  description: "Handcrafted jewelry with elegance",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
