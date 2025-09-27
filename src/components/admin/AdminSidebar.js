import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  CubeIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  UsersIcon,
  TagIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline"

const navItems = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Products", href: "/admin/products", icon: CubeIcon },
  { name: "Categories", href: "/admin/categories", icon: Squares2X2Icon },
  { name: "Community Reviews", href: "/admin/community-reviews", icon: ChatBubbleLeftRightIcon },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBagIcon },
  { name: "Customers", href: "/admin/customers", icon: UsersIcon },
  { name: "Coupons", href: "/admin/coupons", icon: TagIcon },
  { name: "Settings", href: "/admin/settings", icon: Cog6ToothIcon },
]

export default function AdminSidebar({ className = "w-64 bg-white border-r border-gray-200 p-4" }) {
  const pathname = usePathname()

  return (
    <aside className={className}>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                pathname === item.href ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
