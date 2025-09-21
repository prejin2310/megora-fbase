"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  startAfter,
  endBefore,
  limitToLast,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

const PAGE_SIZE = 8;

export default function ProductsListPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("skuAsc");
  const [loading, setLoading] = useState(true);

  const [lastDoc, setLastDoc] = useState(null);
  const [pageStack, setPageStack] = useState([]);

  const firstDocRef = useRef(null);
  const lastDocRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const snaps = await getDocs(collection(db, "categories"));
        setCategories(snaps.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        toast.error("Failed to load categories");
      }
    })();
  }, []);

  const fetchProducts = useCallback(async (direction = "first") => {
    setLoading(true);
    try {
      let q = query(collection(db, "products"), orderBy("title"), limit(PAGE_SIZE));

      if (direction === "next" && lastDocRef.current) {
        q = query(
          collection(db, "products"),
          orderBy("title"),
          startAfter(lastDocRef.current),
          limit(PAGE_SIZE)
        );
      } else if (direction === "prev" && firstDocRef.current) {
        q = query(
          collection(db, "products"),
          orderBy("title"),
          endBefore(firstDocRef.current),
          limitToLast(PAGE_SIZE)
        );
      }

      const snaps = await getDocs(q);
      const docs = snaps.docs;
      const list = docs.map((d) => ({ id: d.id, ...d.data() }));

      if (direction === "next" && firstDocRef.current) {
        setPageStack((s) => [...s, firstDocRef.current]);
      } else if (direction === "prev") {
        setPageStack((s) => s.slice(0, -1));
      } else if (direction === "first") {
        setPageStack([]);
      }

      firstDocRef.current = docs[0] ?? null;
      lastDocRef.current = docs.length === PAGE_SIZE ? docs[docs.length - 1] : null;

      setLastDoc(lastDocRef.current);
      setItems(list);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts("first");
  }, [fetchProducts]);

  const filtered = useMemo(() => {
    let result = [...items];
    if (categoryFilter) result = result.filter((x) => (x.categoryId || "") === categoryFilter);
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (x) =>
          x.title?.toLowerCase().includes(term) ||
          x.sku?.toLowerCase().includes(term) ||
          x.handle?.toLowerCase().includes(term)
      );
    }

    if (sortBy === "skuAsc" || sortBy === "skuDesc") {
      result.sort((a, b) => {
        const aNum = parseInt((a.sku || "").replace("MJ-", ""), 10) || 0;
        const bNum = parseInt((b.sku || "").replace("MJ-", ""), 10) || 0;
        return sortBy === "skuAsc" ? aNum - bNum : bNum - aNum;
      });
    } else if (sortBy === "title") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return result;
  }, [items, categoryFilter, search, sortBy]);

  const thumbOf = (product) => {
    const media = product.media || [];
    const thumbnail = media.find((item) => item.thumbnail) || media[0];
    return thumbnail?.url || "";
  };

  const isOutOfStock = (product) => {
    if (!product.variants?.length) return false;
    return product.variants.every((variant) => (variant.stock || 0) <= 0);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/admin/products/add" className="px-3 py-2 rounded bg-emerald-700 text-white">
          + Add
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          placeholder="Search by title / sku / slug"
          className="rounded border px-3 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded border px-3 py-2"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name || c.id}
            </option>
          ))}
        </select>
        <select
          className="rounded border px-3 py-2"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="skuAsc">Sort by SKU (Ascending)</option>
          <option value="skuDesc">Sort by SKU (Descending)</option>
          <option value="title">Sort by Title (A-Z)</option>
        </select>
        <button onClick={() => fetchProducts("first")} className="rounded border px-3 py-2">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No products.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((product) => {
              const thumbnail = thumbOf(product) || "/placeholder.png";
              const alt = product.title ? `${product.title} thumbnail` : "Product thumbnail";

              return (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="border rounded overflow-hidden hover:shadow relative"
                >
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={thumbnail}
                      alt={alt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                      unoptimized
                    />
                  </div>
                  <div className="p-2">
                    <div className="text-sm font-medium line-clamp-1">{product.title}</div>
                    <div className="text-xs text-gray-500">{product.sku}</div>
                    <div className="text-xs">{product.status}</div>
                  </div>

                  {isOutOfStock(product) && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                      Out of Stock
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => fetchProducts("prev")}
              disabled={pageStack.length === 0}
              className="px-4 py-2 rounded border disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchProducts("next")}
              disabled={!lastDoc}
              className="px-4 py-2 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
