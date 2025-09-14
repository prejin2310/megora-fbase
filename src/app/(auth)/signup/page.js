"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Disposable email domains (basic list — can expand or fetch from API)
  const disposableDomains = [
    "tempmail.com",
    "mailinator.com",
    "10minutemail.com",
    "guerrillamail.com",
    "trashmail.com",
    "yopmail.com",
    "fakeinbox.com",
  ];

  const validatePhone = (phone) => {
    if (!phone) return true; // optional field
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return false;

    const domain = email.split("@")[1].toLowerCase();
    return !disposableDomains.includes(domain);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePhone(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid non-disposable email address");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signupUser(email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        phone,
        email,
        role: "user",
        createdAt: new Date(),
      });

      router.push("/");
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
            Create Account
          </h2>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-md border focus:ring-2 focus:ring-brand focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                className="w-full p-3 rounded-md border focus:ring-2 focus:ring-brand focus:outline-none"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/[^0-9]/g, ""))
                }
                maxLength={10}
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full p-3 rounded-md border focus:ring-2 focus:ring-brand focus:outline-none"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark transition-colors"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm space-y-2">
            <a href="/login" className="text-brand hover:underline block">
              Already have an account? Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
