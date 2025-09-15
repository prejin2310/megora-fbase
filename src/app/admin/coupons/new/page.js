"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import Link from "next/link";

export default function NewCouponPage() {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [expiry, setExpiry] = useState("");
  const [status, setStatus] = useState("active");

  // Conditions
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [applyScope, setApplyScope] = useState("all"); // all | category | product
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [excludeProducts, setExcludeProducts] = useState([]);
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const [maxUsage, setMaxUsage] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("");

  // Data
  const [categoriesList, setCategoriesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const catSnap = await getDocs(collection(db, "categories"));
      setCategoriesList(catSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const prodSnap = await getDocs(collection(db, "products"));
      setProductsList(prodSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: code.toUpperCase(),
        type: discountType,
        value: Number(discountValue),
        expiry: Timestamp.fromDate(new Date(expiry)),
        status,
        conditions: {
          minAmount: minAmount ? Number(minAmount) : null,
          maxAmount: maxAmount ? Number(maxAmount) : null,
          scope: applyScope,
          applicableCategories: selectedCategories,
          applicableProducts: selectedProducts,
          excludeProducts,
          firstTimeUser,
          maxUsage: maxUsage ? Number(maxUsage) : null,
          perUserLimit: perUserLimit ? Number(perUserLimit) : null,
        },
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "coupons"), payload);
      window.location.href = "/admin/coupons"; // redirect back
    } catch (err) {
      console.error("Error saving coupon:", err);
    }
  };

  // Filtered products (safe: code OR id)
  const filteredProducts = productsList.filter(
    (p) =>
      (p.code || "").toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.id.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const toggleProduct = (prod) => {
    if (selectedProducts.some((p) => p.id === prod.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== prod.id));
    } else {
      setSelectedProducts([...selectedProducts, prod]);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-playfair font-bold mb-6">Add New Coupon</h1>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border p-6 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Coupon Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="FESTIVE10"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Discount Type
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Discount Value
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="10"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white border p-6 rounded-lg shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Conditions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Min Cart Amount
              </label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Max Cart Amount
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Apply Coupon To
            </label>
            <select
              value={applyScope}
              onChange={(e) => setApplyScope(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="all">All Products</option>
              <option value="category">Specific Categories</option>
              <option value="product">Specific Products</option>
            </select>
          </div>

          {/* Categories */}
          {applyScope === "category" && (
            <div>
              <label className="block text-sm font-semibold mb-1">
                Select Categories
              </label>
              <select
                multiple
                value={selectedCategories}
                onChange={(e) =>
                  setSelectedCategories(
                    Array.from(e.target.selectedOptions, (opt) => opt.value)
                  )
                }
                className="border p-2 rounded w-full h-32"
              >
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Products */}
          {applyScope === "product" && (
            <div>
              <label className="block text-sm font-semibold mb-1">
                Search Products
              </label>
              <input
                type="text"
                placeholder="Search by product code or ID..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="border p-2 rounded w-full mb-2"
              />
              <div className="border rounded max-h-40 overflow-y-auto p-2">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center space-x-2"
                    title={prod.name || ""}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.some((p) => p.id === prod.id)}
                      onChange={() => toggleProduct(prod)}
                    />
                    <span>{prod.code || `ID: ${prod.id}`}</span>
                  </div>
                ))}
              </div>

              {/* Selected table */}
{selectedProducts.length > 0 && (
  <table className="mt-4 w-full border">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-2 border">Code</th>
        <th className="p-2 border">ID</th>
        <th className="p-2 border">Name</th>
        <th className="p-2 border text-center">Remove</th>
      </tr>
    </thead>
    <tbody>
      {selectedProducts.map((p) => (
        <tr key={p.id}>
          <td className="p-2 border">{p.code || `ID: ${p.id}`}</td>
          <td className="p-2 border">{p.id}</td>
          <td className="p-2 border">{p.name || "-"}</td>
          <td className="p-2 border text-center">
            <button
              type="button"
              onClick={() =>
                setSelectedProducts(selectedProducts.filter((sp) => sp.id !== p.id))
              }
              className="text-red-600 hover:underline"
            >
              ✕
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}

            </div>
          )}

          {/* First-time / limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={firstTimeUser}
                onChange={(e) => setFirstTimeUser(e.target.checked)}
              />
              <label className="text-sm font-semibold">
                First Time User Only
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Max Usage (Global)
              </label>
              <input
                type="number"
                value={maxUsage}
                onChange={(e) => setMaxUsage(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Per User Limit
              </label>
              <input
                type="number"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Link
            href="/admin/coupons"
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-brand text-white px-6 py-2 rounded-lg shadow hover:bg-brand-dark transition"
          >
            Save Coupon
          </button>
        </div>
      </form>
    </div>
  );
}
