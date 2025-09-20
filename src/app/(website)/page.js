import Categories from "@/components/home/Categories"
import DealOfTheDay from "@/components/home/NecklacesSection"
import HeroBanner from "@/components/home/HeroBanner"
import NewArrivals from "@/components/home/NewArrivals"
import Reviews from "@/components/home/Reviews"
import Navbar from "@/components/layout/Navbar"
import NecklacesSection from "@/components/home/NecklacesSection"
import CategorySection from "@/components/sections/CategorySection"

export default function HomePage() {
  return (
    <main>
      <Navbar/>
      <HeroBanner />
      <NewArrivals />
      {/* Necklaces */}
      <CategorySection
  categoryKey="myjO40rBsif5vugBhTS5"   // the Firestore id of category doc
  title="Necklaces"
  tagline="Discover our latest collection of premium necklaces."
/>

      <Categories/>
      <Reviews/>
    </main>
  )
}
