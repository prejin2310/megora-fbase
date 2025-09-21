"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import toast from "react-hot-toast";
import {
  card,
  cardBody,
  sectionTitle,
  subText,
  inputBase,
  buttonPrimary,
} from "@/components/admin/ui";

import ConfirmModal from "@/components/admin/ConfirmModal";
import InfoModal from "@/components/admin/InfoModal";

const generateSlug = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", slug: "", imageUrl: "" });
  const [editingId, setEditingId] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: null,
  });

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoConfig, setInfoConfig] = useState({
    title: "",
    message: "",
  });

  const fetchCategories = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to fetch categories");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const validateImage = async (url) => {
    try {
      const res = await fetch(url, { method: "HEAD" });
      return res.ok && res.headers.get("content-type")?.startsWith("image/");
    } catch {
      return false;
    }
  };

  const saveCategory = async () => {
    if (!form.name.trim()) return toast.error("Name required");

    const slug = generateSlug(form.name);
    if (!slug) return toast.error("Invalid slug");

    const q = query(collection(db, "categories"), where("slug", "==", slug));
    const snap = await getDocs(q);
    if (!editingId && !snap.empty) return toast.error("Slug already exists");

    if (form.imageUrl && !(await validateImage(form.imageUrl))) {
      return toast.error("Invalid image URL");
    }

    setConfirmConfig({
      title: editingId ? "Update Category" : "Add Category",
      message: editingId
        ? "Are you sure you want to update this category?"
        : "Are you sure you want to add this category?",
      onConfirm: async () => {
        try {
          if (editingId) {
            await updateDoc(doc(db, "categories", editingId), { ...form, slug });
            setInfoConfig({
              title: "Success",
              message: "Category updated successfully!",
            });
          } else {
            await addDoc(collection(db, "categories"), { ...form, slug });
            setInfoConfig({
              title: "Success",
              message: "Category added successfully!",
            });
          }
          setInfoOpen(true);

          setForm({ name: "", slug: "", imageUrl: "" });
          setEditingId(null);
          await fetchCategories();
        } catch {
          toast.error("Failed to save category");
        } finally {
          setConfirmOpen(false);
        }
      },
    });
    setConfirmOpen(true);
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, imageUrl: cat.imageUrl || "" });
    setEditingId(cat.id);
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      title: "Delete Category",
      message: "Are you sure you want to delete this category?",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "categories", id));
          setCategories((prev) => prev.filter((c) => c.id !== id));
          setInfoConfig({
            title: "Deleted",
            message: "Category deleted successfully!",
          });
          setInfoOpen(true);
        } catch {
          toast.error("Failed to delete category");
        } finally {
          setConfirmOpen(false);
        }
      },
    });
    setConfirmOpen(true);
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
        Categories
      </h1>

      <section className={card}>
        <div className={cardBody}>
          <h2 className={sectionTitle}>{editingId ? "Edit Category" : "Add Category"}</h2>
          <p className={subText}>Add a new category or update an existing one.</p>

          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Category name"
              className={inputBase}
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                  slug: generateSlug(e.target.value),
                }))
              }
            />
            <input
              type="text"
              placeholder="Image URL (optional)"
              className={inputBase}
              value={form.imageUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
            />
            {form.slug && <p className="text-xs text-gray-500">Slug: {form.slug}</p>}
            <button onClick={saveCategory} className={buttonPrimary}>
              {editingId ? "Update Category" : "Add Category"}
            </button>
          </div>
        </div>
      </section>

      <section className={`${card} mt-6`}>
        <div className={cardBody}>
          <h2 className={sectionTitle}>All Categories</h2>
          <ul className="mt-4 divide-y border rounded-lg">
            {categories.map((c) => (
              <li key={c.id} className="flex justify-between items-center px-3 py-2">
                <div className="flex items-center gap-3">
                  {c.imageUrl && (
                    <div className="relative h-10 w-10 overflow-hidden rounded">
                      <Image
                        src={c.imageUrl}
                        alt={c.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div>
                    <span className="font-medium">{c.name}</span>
                    <p className="text-xs text-gray-500">{c.slug}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">No categories yet.</li>
            )}
          </ul>
        </div>
      </section>

      <ConfirmModal
        open={confirmOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      <InfoModal
        open={infoOpen}
        title={infoConfig.title}
        message={infoConfig.message}
        onClose={() => setInfoOpen(false)}
      />
    </div>
  );
}
