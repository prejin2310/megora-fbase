"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";
import toast from "react-hot-toast";

// ✅ Heroicons
import {
  HomeIcon,
  CubeIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  UsersIcon,
  TagIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Products", href: "/admin/products", icon: CubeIcon },
  { name: "Categories", href: "/admin/categories", icon: Squares2X2Icon }, // ✅ new
  { name: "Orders", href: "/admin/orders", icon: ShoppingBagIcon },
  { name: "Customers", href: "/admin/customers", icon: UsersIcon },
  { name: "Coupons", href: "/admin/coupons", icon: TagIcon },
  { name: "Settings", href: "/admin/settings", icon: Cog6ToothIcon },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="bg-gray-900 text-white flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded hover:bg-gray-800"
          >
            ☰
          </button>
          <h1 className="font-bold text-xl">Megora Admin</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-white text-gray-900 font-medium px-3 py-1.5 rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-64 bg-white shadow-lg">
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === item.href
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div
              className="flex-1 bg-black/50"
              onClick={() => setMenuOpen(false)}
            />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
