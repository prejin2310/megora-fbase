"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function CouponsList() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await deleteDoc(doc(db, "coupons", id));
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = coupons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(coupons.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading) return <p>Loading coupons...</p>;

  return (
    <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border">Code</th>
            <th className="p-3 border">Value</th>
            <th className="p-3 border">Expiry</th>
            <th className="p-3 border">Conditions</th>
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
              <td className="p-3 border text-sm">
                {coupon.conditions?.minAmount && (
                  <div>Min: ₹{coupon.conditions.minAmount}</div>
                )}
                {coupon.conditions?.maxAmount && (
                  <div>Max: ₹{coupon.conditions.maxAmount}</div>
                )}
                {coupon.conditions?.applicableCategories?.length > 0 && (
                  <div>
                    Categories: {coupon.conditions.applicableCategories.join(", ")}
                  </div>
                )}
                {coupon.conditions?.applicableProducts?.length > 0 && (
                  <div>
                    Products: {coupon.conditions.applicableProducts.join(", ")}
                  </div>
                )}
                {coupon.conditions?.excludeProducts?.length > 0 && (
                  <div>
                    Exclude: {coupon.conditions.excludeProducts.join(", ")}
                  </div>
                )}
                {coupon.conditions?.firstTimeUser && <div>First-time user only</div>}
                {coupon.conditions?.maxUsage && (
                  <div>Max Usage: {coupon.conditions.maxUsage}</div>
                )}
                {coupon.conditions?.perUserLimit && (
                  <div>Per User: {coupon.conditions.perUserLimit}</div>
                )}
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
              <td className="p-3 border">
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
              currentPage === i + 1 ? "bg-green-600 text-white" : ""
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
