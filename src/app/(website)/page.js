import HeroBanner from "@/components/home/HeroBanner"
import NewArrivals from "@/components/home/NewArrivals"
import Navbar from "@/components/layout/Navbar"

export default function HomePage() {
  return (
    <main>
      <Navbar/>
      <HeroBanner />
      <NewArrivals />
    </main>
  )
}
