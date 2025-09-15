"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Sort
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchCoupons = async () => {
    try {
      const snapshot = await getDocs(collection(db, "coupons"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCoupons(list);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteDoc(doc(db, "coupons", id));
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  // Filter + Sort
  const filteredCoupons = coupons
    .filter((c) => c.code.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (aVal?.toDate) aVal = aVal.toDate();
      if (bVal?.toDate) bVal = bVal.toDate();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCoupons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading) return <p className="p-4">Loading coupons...</p>;

  return (
    <div className="p-6 font-inter text-gray-800">
      <h1 className="text-3xl font-playfair font-bold mb-6">Coupons</h1>

      {/* Search + Sort + Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-64"
        />

        <div className="flex gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="createdAt">Created</option>
            <option value="expiry">Expiry</option>
            <option value="value">Value</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="desc">↓ Desc</option>
            <option value="asc">↑ Asc</option>
          </select>
          <Link
            href="/admin/coupons/new"
            className="bg-brand text-white px-5 py-2 rounded-lg shadow hover:bg-brand-dark transition"
          >
            ➕ Add Coupon
          </Link>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-brand-light text-left">
              <th className="p-3 border">Code</th>
              <th className="p-3 border">Value</th>
              <th className="p-3 border">Expiry</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="p-3 border font-semibold">{coupon.code}</td>
                <td className="p-3 border">
                  {coupon.type === "percent"
                    ? `${coupon.value}%`
                    : `₹${coupon.value}`}
                </td>
                <td className="p-3 border">
                  {coupon.expiry?.toDate
                    ? coupon.expiry.toDate().toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      coupon.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coupon.status}
                  </span>
                </td>
                <td className="p-3 border flex gap-2">
                  <Link
                    href={`/admin/coupons/${coupon.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={`px-3 py-1 border rounded ${
              currentPage === i + 1 ? "bg-brand text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
