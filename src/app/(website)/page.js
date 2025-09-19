import Categories from "@/components/home/Categories"
import HeroBanner from "@/components/home/HeroBanner"
import NewArrivals from "@/components/home/NewArrivals"
import Reviews from "@/components/home/Reviews"
import Navbar from "@/components/layout/Navbar"

export default function HomePage() {
  return (
    <main>
      <Navbar/>
      <HeroBanner />
      <NewArrivals />
      <Categories/>
      <Reviews/>
    </main>
  )
}
