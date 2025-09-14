"use client";

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import toast from "react-hot-toast";

/**
 * Reusable Product Form
 * - Used by AddProductPage and EditProductPage
 * - Supports multi-step wizard (Details → Media → Variants → Review)
 */
export default function ProductForm({
  initialData = null,
  onSubmit, // function to call with final product data
  submitLabel = "Save Product",
}) {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(null);

  // States
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [handle, setHandle] = useState(initialData?.handle || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [category, setCategory] = useState(initialData?.category || "");

  const [media, setMedia] = useState(
    initialData?.media?.length
      ? initialData.media
      : [{ url: "", thumbnail: false, variant: "" }]
  );

  const [variants, setVariants] = useState(
    initialData?.variants?.length
      ? initialData.variants
      : [{ title: "", options: [{ name: "", price: "", stock: "" }] }]
  );

  // --- Media Upload ---
  const handleFileUpload = async (file, i) => {
    if (!file) return;
    try {
      setUploading(i);
      const folder = sku || `temp-${Date.now()}`;
      const fileRef = ref(storage, `products/${folder}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      const updated = [...media];
      updated[i].url = url;
      setMedia(updated);
      toast.success("Image uploaded ✅");
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveMedia = async (i) => {
    const removed = media[i];
    setMedia(media.filter((_, idx) => idx !== i));
    if (removed.url && removed.url.startsWith("https")) {
      try {
        const urlPath = decodeURIComponent(removed.url.split("/o/")[1].split("?")[0]);
        await deleteObject(ref(storage, urlPath));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  // --- Variant helpers ---
  const handleVariantTitleChange = (i, value) => {
    const updated = [...variants];
    updated[i].title = value;
    setVariants(updated);
  };
  const handleOptionChange = (vi, oi, field, value) => {
    const updated = [...variants];
    updated[vi].options[oi][field] = value;
    setVariants(updated);
  };
  const handleAddOption = (vi) => {
    const updated = [...variants];
    updated[vi].options.push({ name: "", price: "", stock: "" });
    setVariants(updated);
  };
  const handleAddVariant = () => {
    setVariants([...variants, { title: "", options: [{ name: "", price: "", stock: "" }] }]);
  };

  // --- Final Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const product = {
      title,
      subtitle,
      handle,
      description,
      sku,
      category,
      media: media.filter((m) => m.url.trim() !== ""),
      variants: variants.filter((v) => v.title.trim() !== ""),
    };
    await onSubmit(product);
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && step < 4) e.preventDefault();
      }}
      className="space-y-6"
    >
      {/* Step Indicators */}
      <div className="flex justify-between mb-6">
        {["Details", "Media", "Variants", "Review"].map((label, idx) => {
          const current = idx + 1;
          return (
            <div key={idx} className="flex-1 text-center">
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  step >= current ? "bg-brand text-white" : "bg-gray-200"
                }`}
              >
                {current}
              </div>
              <p className="text-xs mt-1">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Title *</label>
              <input
                className="w-full border p-2 rounded"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm">Subtitle</label>
              <input
                className="w-full border p-2 rounded"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm">Handle (slug)</label>
            <input
              className="w-full border p-2 rounded"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">Description</label>
            <textarea
              className="w-full border p-2 rounded"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">SKU *</label>
            <input
              className="w-full border p-2 rounded"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">Category</label>
            <select
              className="w-full border p-2 rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              <option value="necklace">Necklace</option>
              <option value="earrings">Earrings</option>
              <option value="haram">Haram</option>
              <option value="bridal">Bridal Combo</option>
              <option value="adstone">AD Stone</option>
              <option value="antitarnish">Anti Tarnish</option>
              <option value="ring">Ring</option>
              <option value="earning">Earring</option>
            </select>
          </div>
        </section>
      )}

      {/* Step 2: Media */}
      {step === 2 && (
        <section>
          {media.map((m, i) => (
            <div key={i} className="flex flex-col md:flex-row items-center gap-3 mb-3">
              {m.url ? (
                <img src={m.url} alt="preview" className="w-20 h-20 object-cover rounded border" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 border flex items-center justify-center text-xs">
                  No Image
                </div>
              )}
              <label className="cursor-pointer px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                {uploading === i ? "Uploading..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files[0], i)}
                />
              </label>
              <input
                placeholder="Variant (optional)"
                className="border p-2 rounded md:w-40"
                value={m.variant}
                onChange={(e) => {
                  const updated = [...media];
                  updated[i].variant = e.target.value;
                  setMedia(updated);
                }}
              />
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={m.thumbnail}
                  onChange={(e) => {
                    const updated = [...media];
                    updated.forEach((m, idx) => (updated[idx].thumbnail = idx === i));
                    setMedia(updated);
                  }}
                />
                Thumbnail
              </label>
              <button
                type="button"
                onClick={() => handleRemoveMedia(i)}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMedia([...media, { url: "", thumbnail: false, variant: "" }])}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            + Add Image
          </button>
        </section>
      )}

      {/* Step 3: Variants */}
      {step === 3 && (
        <section>
          {variants.map((v, vi) => (
            <div key={vi} className="border p-3 rounded mb-3">
              <label className="block text-sm mb-2">Variant Title</label>
              <input
                placeholder="e.g. Color"
                className="w-full border p-2 rounded mb-3"
                value={v.title}
                onChange={(e) => handleVariantTitleChange(vi, e.target.value)}
              />
              {v.options.map((opt, oi) => (
                <div key={oi} className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    placeholder="Option (e.g. Ruby)"
                    className="border p-2 rounded"
                    value={opt.name}
                    onChange={(e) => handleOptionChange(vi, oi, "name", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    className="border p-2 rounded"
                    value={opt.price}
                    onChange={(e) => handleOptionChange(vi, oi, "price", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    className="border p-2 rounded"
                    value={opt.stock}
                    onChange={(e) => handleOptionChange(vi, oi, "stock", e.target.value)}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddOption(vi)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                + Add Option
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddVariant}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            + Add Variant
          </button>
        </section>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Review Product</h2>
          <p><strong>Title:</strong> {title}</p>
          <p><strong>SKU:</strong> {sku}</p>
          <p><strong>Category:</strong> {category || "Not selected"}</p>
          <p><strong>Variants:</strong> {variants.length}</p>
          <p><strong>Images:</strong> {media.filter((m) => m.url).length}</p>
        </section>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 border rounded"
          >
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="px-4 py-2 bg-brand text-white rounded"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="px-6 py-2 bg-brand text-white rounded hover:bg-brand-dark"
          >
            {submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}
