"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await loginUser(email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        router.push(userDoc.data().role === "admin" ? "/admin" : "/");
      } else {
        setError("No user record found.");
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen relative">
      {/* Desktop Left Image */}
      <div className="hidden md:flex w-1/2 relative">
        <Image
          src="/product3.jpg"
          alt="Megora Jewels"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Mobile Background */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src="/product3.jpg"
          alt="Megora Jewels"
          fill
          className="object-cover blur-sm opacity-70"
        />
        <div className="absolute inset-0 bg-white/30" />
      </div>

      {/* Right Side Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 relative">
        <div className="w-full max-w-md bg-white/90 md:bg-white rounded-2xl shadow-lg p-8 backdrop-blur-md">
          <h2 className="text-3xl font-bold font-playfair text-brand text-center mb-6">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full p-3 rounded-md border focus:ring-2 focus:ring-brand focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full p-3 rounded-md border focus:ring-2 focus:ring-brand focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark transition-colors"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm space-y-2">
            <a href="/reset-password" className="text-brand hover:underline block">
              Forgot Password?
            </a>
            <a href="/signup" className="text-brand hover:underline block">
              Don’t have an account? Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
