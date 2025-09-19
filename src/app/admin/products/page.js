"use client";

import { useEffect, useMemo, useState } from "react";
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
import toast from "react-hot-toast";

const PAGE_SIZE = 8;

export default function ProductsListPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cat, setCat] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("skuAsc"); // default sort by SKU Asc
  const [loading, setLoading] = useState(true);

  // pagination
  const [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);
  const [pageStack, setPageStack] = useState([]);

  // fetch categories
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

  const fetchProducts = async (direction = "first") => {
    setLoading(true);
    try {
      let q = query(collection(db, "products"), orderBy("title"), limit(PAGE_SIZE));

      if (direction === "next" && lastDoc) {
        q = query(collection(db, "products"), orderBy("title"), startAfter(lastDoc), limit(PAGE_SIZE));
      } else if (direction === "prev" && firstDoc) {
        q = query(
          collection(db, "products"),
          orderBy("title"),
          endBefore(firstDoc),
          limitToLast(PAGE_SIZE)
        );
      }

      const snaps = await getDocs(q);
      let list = snaps.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (list.length > 0) {
        setFirstDoc(snaps.docs[0]);
        setLastDoc(snaps.docs[snaps.docs.length - 1]);
      }

      if (direction === "next") {
        setPageStack((s) => [...s, firstDoc]);
      } else if (direction === "prev") {
        setPageStack((s) => s.slice(0, -1));
      } else {
        setPageStack([]);
      }

      setItems(list);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts("first");
  }, []);

  // filtering + sorting
  const filtered = useMemo(() => {
    let r = [...items];
    if (cat) r = r.filter((x) => (x.categoryId || "") === cat);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      r = r.filter(
        (x) =>
          x.title?.toLowerCase().includes(s) ||
          x.sku?.toLowerCase().includes(s) ||
          x.handle?.toLowerCase().includes(s)
      );
    }

    // ✅ Apply sorting
    if (sortBy === "skuAsc" || sortBy === "skuDesc") {
      r.sort((a, b) => {
        const aNum = parseInt((a.sku || "").replace("MJ-", ""), 10) || 0;
        const bNum = parseInt((b.sku || "").replace("MJ-", ""), 10) || 0;
        return sortBy === "skuAsc" ? aNum - bNum : bNum - aNum;
      });
    } else if (sortBy === "title") {
      r.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return r;
  }, [items, cat, search, sortBy]);

  const thumbOf = (p) => {
    const m = p.media || [];
    const t = m.find((i) => i.thumbnail) || m[0];
    return t?.url || "";
  };

  const isOutOfStock = (p) => {
    if (!p.variants?.length) return false;
    return p.variants.every((v) => (v.stock || 0) <= 0);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link
          href="/admin/products/add"
          className="px-3 py-2 rounded bg-emerald-700 text-white"
        >
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
          value={cat}
          onChange={(e) => setCat(e.target.value)}
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
          <option value="title">Sort by Title (A–Z)</option>
        </select>
        <button
          onClick={() => fetchProducts("first")}
          className="rounded border px-3 py-2"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No products.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="border rounded overflow-hidden hover:shadow relative"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={thumbOf(p) || "/placeholder.png"}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <div className="text-sm font-medium line-clamp-1">{p.title}</div>
                  <div className="text-xs text-gray-500">{p.sku}</div>
                  <div className="text-xs">{p.status}</div>
                </div>

                {isOutOfStock(p) && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                    Out of Stock
                  </span>
                )}
              </Link>
            ))}
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
