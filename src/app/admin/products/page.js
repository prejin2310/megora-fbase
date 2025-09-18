"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

import {
  card, cardBody, sectionTitle, subText,
  inputBase, selectBase, buttonPrimary, buttonGhost,
  tableWrap, tableBase, thBase, tdBase, rowHover
} from "@/components/admin/ui";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploading, setUploading] = useState(null);
  const [expanded, setExpanded] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
      setFiltered(productList);
    } catch (err) {
      toast.error("Failed to fetch products");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleUpload = async (file, productId) => {
    if (!file) return;
    try {
      setUploading(productId);
      const fileRef = ref(storage, `products/${productId}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      const productRef = doc(db, "products", productId);
      const product = products.find((p) => p.id === productId);
      const media = product.media || [];
      const updatedMedia = [...media, { url, thumbnail: false }];

      await updateDoc(productRef, { media: updatedMedia });

      toast.success("Image uploaded ✅");
      fetchProducts();
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleVariantUpdate = async (productId, vi, oi, field, value) => {
    try {
      const productRef = doc(db, "products", productId);
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const updatedVariants = [...(product.variants || [])];
      updatedVariants[vi].options[oi][field] = value;

      await updateDoc(productRef, { variants: updatedVariants });
      toast.success("Variant updated ✅");

      fetchProducts();
    } catch (err) {
      toast.error("Failed to update variant: " + err.message);
    }
  };

  // Filtering
  useEffect(() => {
    let result = [...products];

    if (search.trim() !== "") {
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.sku?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [search, categoryFilter, products]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Products</h1>
          <p className={subText}>View, edit and manage your product catalog.</p>
        </div>
        <Link href="/admin/products/add" className={buttonPrimary}>
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <section className={`${card} mb-6`}>
        <div className={cardBody}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by title or SKU..."
                className={inputBase}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                className={selectBase}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className={card}>
        <div className={cardBody}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={sectionTitle}>All Products</h2>
            <span className={subText}>{filtered.length} result(s)</span>
          </div>

          <div className={tableWrap}>
            <table className={tableBase}>
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th className={thBase}>Product</th>
                  <th className={thBase}>Category</th>
                  <th className={thBase}>SKU</th>
                  <th className={thBase}>Price</th>
                  <th className={thBase}>Stock</th>
                  <th className={thBase}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className={tdBase} colSpan={6}>Loading…</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td className={tdBase} colSpan={6}>No products found.</td></tr>
                ) : (
                  currentItems.map((p) => {
                    const thumb =
                      p.media?.find((m) => m.thumbnail)?.url ||
                      p.media?.[0]?.url ||
                      "/logo.png";

                    const stock =
                      p.stock ??
                      p.variants?.reduce(
                        (sum, v) =>
                          sum +
                          v.options?.reduce(
                            (osum, o) => osum + (parseInt(o.stock) || 0),
                            0
                          ),
                        0
                      ) ??
                      0;

                    const price =
                      p.price ??
                      (p.variants?.flatMap((v) =>
                        v.options.map((o) => parseFloat(o.price) || 0)
                      ) || [0]);
                    const displayPrice = Array.isArray(price)
                      ? `₹${Math.min(...price)}+`
                      : `₹${price}`;

                    return (
                      <>
                        <tr key={p.id} className={rowHover}>
                          <td className={tdBase}>
                            <div className="flex items-center gap-3">
                              <Image
                                src={thumb}
                                alt={p.title}
                                width={50}
                                height={50}
                                className="rounded-lg object-cover border"
                              />
                              <span className="font-medium text-gray-900">{p.title}</span>
                            </div>
                          </td>
                          <td className={tdBase}>{p.category || "-"}</td>
                          <td className={tdBase}>{p.sku}</td>
                          <td className={tdBase}>{displayPrice}</td>
                          <td className={tdBase}>{stock}</td>
                          <td className={tdBase}>
                            <div className="flex flex-wrap gap-2">
                              <Link href={`/admin/products/${p.id}`} className={buttonGhost}>
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="text-red-600 hover:underline text-sm"
                              >
                                Delete
                              </button>
                              <label className="px-3 py-1 border rounded-lg text-xs cursor-pointer bg-gray-50 hover:bg-gray-100">
                                {uploading === p.id ? "Uploading…" : "Upload"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleUpload(e.target.files[0], p.id)}
                                  disabled={uploading === p.id}
                                />
                              </label>
                              {p.variants?.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpanded(expanded === p.id ? null : p.id)
                                  }
                                  className="px-3 py-1 border rounded-lg text-xs bg-gray-50 hover:bg-gray-100"
                                >
                                  {expanded === p.id ? "Hide Variants" : "Show Variants"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Variants */}
                        {expanded === p.id && p.variants?.length > 0 && (
                          <tr>
                            <td colSpan="6" className="bg-gray-50 p-4">
                              <div className="overflow-x-auto">
                                <table className="w-full border text-sm">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="p-2 text-left">Variant</th>
                                      <th className="p-2 text-left">Option</th>
                                      <th className="p-2 text-left">Price</th>
                                      <th className="p-2 text-left">Stock</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {p.variants.map((v, vi) =>
                                      v.options.map((o, oi) => (
                                        <tr key={`${vi}-${oi}`} className="border-b">
                                          <td className="p-2">{v.title}</td>
                                          <td className="p-2">{o.name}</td>
                                          <td className="p-2">
                                            <input
                                              type="number"
                                              className={inputBase + " w-24 h-8 text-sm"}
                                              defaultValue={o.price}
                                              onBlur={(e) =>
                                                handleVariantUpdate(
                                                  p.id,
                                                  vi,
                                                  oi,
                                                  "price",
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </td>
                                          <td className="p-2">
                                            <input
                                              type="number"
                                              className={inputBase + " w-24 h-8 text-sm"}
                                              defaultValue={o.stock}
                                              onBlur={(e) =>
                                                handleVariantUpdate(
                                                  p.id,
                                                  vi,
                                                  oi,
                                                  "stock",
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentPage === i + 1
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
