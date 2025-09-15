"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function AddCouponForm({ onAdded }) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [expiry, setExpiry] = useState("");

  // Conditions
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [categories, setCategories] = useState("");
  const [products, setProducts] = useState("");
  const [excludeProducts, setExcludeProducts] = useState("");
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const [maxUsage, setMaxUsage] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("");

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountValue || !expiry) return;

    try {
      await addDoc(collection(db, "coupons"), {
        code: code.toUpperCase(),
        type: discountType,
        value: Number(discountValue),
        expiry: Timestamp.fromDate(new Date(expiry)),
        status: "active",
        usageCount: 0,
        createdAt: new Date().toISOString(),
        conditions: {
          minAmount: minAmount ? Number(minAmount) : null,
          maxAmount: maxAmount ? Number(maxAmount) : null,
          applicableCategories: categories
            ? categories.split(",").map((c) => c.trim())
            : [],
          applicableProducts: products
            ? products.split(",").map((p) => p.trim())
            : [],
          excludeProducts: excludeProducts
            ? excludeProducts.split(",").map((p) => p.trim())
            : [],
          firstTimeUser,
          maxUsage: maxUsage ? Number(maxUsage) : null,
          perUserLimit: perUserLimit ? Number(perUserLimit) : null,
        },
      });

      // Reset form
      setCode("");
      setDiscountType("percent");
      setDiscountValue("");
      setExpiry("");
      setMinAmount("");
      setMaxAmount("");
      setCategories("");
      setProducts("");
      setExcludeProducts("");
      setFirstTimeUser(false);
      setMaxUsage("");
      setPerUserLimit("");

      if (onAdded) onAdded(); // refresh parent list
    } catch (error) {
      console.error("Error adding coupon:", error);
    }
  };

  return (
    <form
      onSubmit={handleAddCoupon}
      className="border p-6 rounded-xl bg-white shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Coupon Code */}
      <div>
        <label className="block text-sm font-semibold mb-1">Coupon Code</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="FESTIVE10"
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Discount Type */}
      <div>
        <label className="block text-sm font-semibold mb-1">Discount Type</label>
        <select
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="percent">Percent (%)</option>
          <option value="fixed">Fixed (₹)</option>
        </select>
      </div>

      {/* Value */}
      <div>
        <label className="block text-sm font-semibold mb-1">Discount Value</label>
        <input
          type="number"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder="10"
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Expiry */}
      <div>
        <label className="block text-sm font-semibold mb-1">Expiry Date</label>
        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Conditions */}
      <div>
        <label className="block text-sm font-semibold mb-1">Min Cart Amount</label>
        <input
          type="number"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          placeholder="500"
          className="border p-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Max Cart Amount</label>
        <input
          type="number"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          placeholder="5000"
          className="border p-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Categories</label>
        <input
          type="text"
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
          placeholder="Rings, Necklaces"
          className="border p-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Products (IDs)</label>
        <input
          type="text"
          value={products}
          onChange={(e) => setProducts(e.target.value)}
          placeholder="prod123, prod456"
          className="border p-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Exclude Products</label>
        <input
          type="text"
          value={excludeProducts}
          onChange={(e) => setExcludeProducts(e.target.value)}
          placeholder="prod789"
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={firstTimeUser}
          onChange={(e) => setFirstTimeUser(e.target.checked)}
        />
        <span className="text-sm font-semibold">First Time User Only</span>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Max Usage</label>
        <input
          type="number"
          value={maxUsage}
          onChange={(e) => setMaxUsage(e.target.value)}
          placeholder="100"
          className="border p-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Per User Limit</label>
        <input
          type="number"
          value={perUserLimit}
          onChange={(e) => setPerUserLimit(e.target.value)}
          placeholder="1"
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all md:col-span-2"
      >
        Add Coupon
      </button>
    </form>
  );
}
