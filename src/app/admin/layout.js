"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";
import toast from "react-hot-toast";
import "@/app/globals.css";

const navItems = [
  { name: "Dashboard", href: "/admin" },
  { name: "Products", href: "/admin/products" },
  { name: "Orders", href: "/admin/orders" },
  { name: "Customers", href: "/admin/customers" },
  { name: "Coupons", href: "/admin/coupons" },
  { name: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-brand text-white flex flex-col">
        <div className="p-6 text-2xl font-playfair font-bold border-b border-white/20">
          Megora Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-3 py-2 rounded-md transition ${
                pathname === item.href
                  ? "bg-brand-dark text-white"
                  : "hover:bg-white/10"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full bg-white text-brand font-semibold py-2 rounded-md hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-6">{children}</div>
    </div>
  );
}
