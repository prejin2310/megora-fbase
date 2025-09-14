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

  const handleSetThumbnail = async (productId, url) => {
    try {
      const productRef = doc(db, "products", productId);
      const product = products.find((p) => p.id === productId);
      const media = (product.media || []).map((m) => ({
        ...m,
        thumbnail: m.url === url,
      }));

      await updateDoc(productRef, { media });
      toast.success("Thumbnail updated ✅");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to set thumbnail: " + err.message);
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
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-brand">Products</h1>
        <Link
          href="/admin/products/add"
          className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-dark"
        >
          + Add Product
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title or SKU..."
          className="border rounded p-2 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded p-2 md:w-48"
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

      {loading ? (
        <p>Loading...</p>
      ) : currentItems.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Thumbnail</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">SKU</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Stock</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((p) => {
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
                      {/* Main Row */}
                      <tr key={p.id} className="border-b align-top">
                        <td className="p-3">
                          <Image
                            src={thumb}
                            alt={p.title}
                            width={50}
                            height={50}
                            className="rounded object-cover"
                          />
                        </td>
                        <td className="p-3 font-medium">{p.title}</td>
                        <td className="p-3">{p.category || "-"}</td>
                        <td className="p-3">{p.sku}</td>
                        <td className="p-3">{displayPrice}</td>
                        <td className="p-3">{stock}</td>
                        <td className="p-3 flex flex-col gap-2 md:flex-row justify-center">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs md:text-sm text-center"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs md:text-sm text-center"
                          >
                            Delete
                          </button>
                          <label className="px-3 py-1 bg-gray-200 text-gray-700 rounded cursor-pointer hover:bg-gray-300 text-xs md:text-sm text-center">
                            {uploading === p.id ? "Uploading..." : "Upload Image"}
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
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs md:text-sm text-center"
                            >
                              {expanded === p.id ? "Hide Variants" : "Show Variants"}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Variant Row */}
                      {expanded === p.id && p.variants?.length > 0 && (
                        <tr>
                          <td colSpan="7" className="bg-gray-50 p-4">
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
                                            className="border p-1 w-20 rounded"
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
                                            className="border p-1 w-20 rounded"
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
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
