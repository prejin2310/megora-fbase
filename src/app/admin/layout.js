"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

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
  const { user, initializing } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  // Redirect logic:
  // - If auth is still initializing, do nothing
  // - If user is signed in but not an admin -> redirect to homepage
  // - If user is not signed in (logged out) -> redirect to login
  useEffect(() => {
    if (initializing) return; // wait until auth is resolved

    if (user && user.role !== "admin") {
      // signed-in but not admin — redirect to homepage
      router.replace("/");
      return;
    }

    if (!user) {
      // not signed in — go to login page
      router.replace("/login");
      return;
    }
  }, [user, initializing, router]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutUser();
      // Use replace to avoid keeping /admin in history
      router.replace("/login");
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("logout error", err);
      toast.error("Logout failed: " + (err?.message || "unknown error"));
    } finally {
      setLoggingOut(false);
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
          disabled={loggingOut}
          className={`text-sm bg-white text-gray-900 font-medium px-3 py-1.5 rounded ${loggingOut ? "opacity-70 cursor-wait" : "hover:bg-gray-100"}`}
        >
          {loggingOut ? "Logging out…" : "Logout"}
        </button>
      </header>

      <div className="flex flex-1">
        {/* While auth is initializing, show a simple loading state to avoid flicker */}
        {initializing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
            <div className="text-gray-700">Checking admin access…</div>
          </div>
        )}
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
