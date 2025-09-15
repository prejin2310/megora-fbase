"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

export default function CouponFormModal({ coupon, onClose, onSaved }) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [expiry, setExpiry] = useState("");
  const [status, setStatus] = useState("active");

  // Conditions
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [excludeProducts, setExcludeProducts] = useState("");
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const [maxUsage, setMaxUsage] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("");

  // Fetched data
  const [categoriesList, setCategoriesList] = useState([]);
  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const catSnap = await getDocs(collection(db, "categories"));
      setCategoriesList(catSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const prodSnap = await getDocs(collection(db, "products"));
      setProductsList(prodSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code || "");
      setDiscountType(coupon.type || "percent");
      setDiscountValue(coupon.value || "");
      setExpiry(
        coupon.expiry?.toDate
          ? coupon.expiry.toDate().toISOString().slice(0, 10)
          : ""
      );
      setStatus(coupon.status || "active");

      // load conditions if editing
      setMinAmount(coupon.conditions?.minAmount || "");
      setMaxAmount(coupon.conditions?.maxAmount || "");
      setSelectedCategories(coupon.conditions?.applicableCategories || []);
      setSelectedProducts(coupon.conditions?.applicableProducts || []);
      setExcludeProducts(coupon.conditions?.excludeProducts?.join(", ") || "");
      setFirstTimeUser(coupon.conditions?.firstTimeUser || false);
      setMaxUsage(coupon.conditions?.maxUsage || "");
      setPerUserLimit(coupon.conditions?.perUserLimit || "");
    }
  }, [coupon]);

  const handleSubmit = async (e) => {
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
          applicableCategories: selectedCategories,
          applicableProducts: selectedProducts,
          excludeProducts: excludeProducts
            ? excludeProducts.split(",").map((p) => p.trim())
            : [],
          firstTimeUser,
          maxUsage: maxUsage ? Number(maxUsage) : null,
          perUserLimit: perUserLimit ? Number(perUserLimit) : null,
        },
      };

      if (coupon) {
        await updateDoc(doc(db, "coupons", coupon.id), payload);
      } else {
        await addDoc(collection(db, "coupons"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving coupon:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          {coupon ? "Edit Coupon" : "Add Coupon"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Coupon Code */}
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

          {/* Discount Type */}
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

          {/* Value */}
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

          {/* Expiry */}
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

          {/* Status */}
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

          {/* Min / Max */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Min Cart Amount
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="500"
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
              placeholder="5000"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Categories Multi-select */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Applicable Categories
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

          {/* Products Multi-select */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Applicable Products
            </label>
            <select
              multiple
              value={selectedProducts}
              onChange={(e) =>
                setSelectedProducts(
                  Array.from(e.target.selectedOptions, (opt) => opt.value)
                )
              }
              className="border p-2 rounded w-full h-32"
            >
              {productsList.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name || prod.id}
                </option>
              ))}
            </select>
          </div>

          {/* Exclude Products */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Exclude Products (IDs)
            </label>
            <input
              type="text"
              value={excludeProducts}
              onChange={(e) => setExcludeProducts(e.target.value)}
              placeholder="prod789"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* First Time */}
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

          {/* Max Usage */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Max Usage (Global)
            </label>
            <input
              type="number"
              value={maxUsage}
              onChange={(e) => setMaxUsage(e.target.value)}
              placeholder="100"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Per User Limit */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Per User Limit
            </label>
            <input
              type="number"
              value={perUserLimit}
              onChange={(e) => setPerUserLimit(e.target.value)}
              placeholder="1"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-brand text-white px-6 py-2 rounded-lg shadow hover:bg-brand-dark transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
