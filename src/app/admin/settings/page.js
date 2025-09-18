"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import {
  card, cardBody, sectionTitle, subText,
  inputBase, buttonPrimary, buttonGhost
} from "@/components/admin/ui";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [bannerText, setBannerText] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "store"));
        if (snap.exists()) {
          const data = snap.data();
          setSettings(data);
          setBannerText(data.bannerText || "");
          setBannerImage(data.bannerImage || "");
        }
        const catSnap = await getDocs(collection(db, "categories"));
        setCategories(catSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const saveBanner = async () => {
    try {
      await setDoc(doc(db, "settings", "store"), {
        ...settings,
        bannerText,
        bannerImage,
      });
      toast.success("Banner updated");
    } catch (err) {
      toast.error("Failed to update banner");
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const fileRef = ref(storage, `banners/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setBannerImage(url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await addDoc(collection(db, "categories"), { name: newCategory });
      setNewCategory("");
      toast.success("Category added");
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      toast.error("Failed to add category");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
        Settings
      </h1>

      {/* Banner Section */}
      <section className={`${card} mb-6`}>
        <div className={cardBody}>
          <h2 className={sectionTitle}>Homepage Banner</h2>
          <p className={subText}>Manage banner text and image for the store.</p>
          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Banner text"
              className={inputBase}
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
            />
            <div>
              {bannerImage && (
                <img
                  src={bannerImage}
                  alt="Banner"
                  className="h-32 w-full object-cover rounded-lg mb-2"
                />
              )}
              <label className="block">
                <span className="text-sm text-gray-600">Upload new image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  disabled={uploading}
                  className="block mt-1"
                />
              </label>
            </div>
            <button onClick={saveBanner} className={buttonPrimary}>
              Save Banner
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={card}>
        <div className={cardBody}>
          <h2 className={sectionTitle}>Categories</h2>
          <p className={subText}>Add or remove product categories.</p>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="New category"
              className={inputBase}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button onClick={addCategory} className={buttonPrimary}>
              Add
            </button>
          </div>
          <ul className="mt-4 divide-y border rounded-lg">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex justify-between items-center px-3 py-2"
              >
                <span>{c.name}</span>
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">
                No categories yet.
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
