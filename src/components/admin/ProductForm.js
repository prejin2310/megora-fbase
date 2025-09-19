"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection, doc, getDocs, query, where,
  addDoc, updateDoc, serverTimestamp, deleteDoc,
} from "firebase/firestore";
import {
  ref as sRef, uploadBytes, getDownloadURL, deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import toast from "react-hot-toast";

// ---------- Config ----------
const CURRENCIES = ["INR", "USD", "EUR", "AED"];
const FX = { USD: 83, EUR: 90, AED: 22.6 }; // INR conversion
const FAKE_MARKUP = 0.4; // +40%

// ---------- Helpers ----------
const slugify = (t = "") =>
  t.toString().trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

const round = (n) => Math.round(Number(n) || 0);

const buildPriceFromINR = (inr) => {
  const p = Number(inr) || 0;
  return {
    INR: round(p),
    USD: round(p / FX.USD),
    EUR: round(p / FX.EUR),
    AED: round(p / FX.AED),
  };
};

const buildFakePrice = (priceObj, override) => {
  if (override && override > 0) return round(override);
  return round((priceObj?.INR || 0) * (1 + FAKE_MARKUP));
};

const pathForUpload = (sku, variantId, file) =>
  `products/${sku || "no-sku"}/${variantId || "default"}/${Date.now()}_${file.name}`;

const ensureNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const deleteByUrl = async (url) => {
  try {
    const r = sRef(storage, url);
    await deleteObject(r);
  } catch {
    // ignore if file missing
  }
};

// ---------- Component ----------
export default function ProductForm({
  initialData = null,
  onSaved,
  mode = "create", // create | edit
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [handle, setHandle] = useState(initialData?.handle || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [status, setStatus] = useState(initialData?.status || "active");

  // categories
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [categories, setCategories] = useState([]);

  // sku error
  const [skuError, setSkuError] = useState("");

  // global attributes
  const [attributes, setAttributes] = useState(
    initialData?.attributes || {
      weight: "",
      length: "",
      width: "",
      height: "",
      material: "",
      hsCode: "",
      originCountry: "",
    }
  );

  // variants
  const [variants, setVariants] = useState(
    initialData?.variants?.length
      ? initialData.variants
      : [
          {
            id: "default",
            options: [{ title: "Color", name: "Gold" }],
            priceINR: 0,
            prices: buildPriceFromINR(0),
            fakePriceINR: buildFakePrice({ INR: 0 }),
            stock: 0,
            images: [],
            attributes: { size: "", weight: "" }, // per variant
          },
        ]
  );

  const [saving, setSaving] = useState(false);

  // slug auto
  useEffect(() => {
    if (!initialData?.handle || mode === "create") {
      setHandle(slugify(title));
    }
  }, [title]); // eslint-disable-line

  // categories fetch
  useEffect(() => {
    (async () => {
      try {
        const snaps = await getDocs(collection(db, "categories"));
        const list = snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCategories(list);
      } catch {
        toast.error("Failed to load categories");
      }
    })();
  }, []);

  // SKU uniqueness check (live debounce)
  useEffect(() => {
    if (!sku.trim()) {
      setSkuError("");
      return;
    }
    const timer = setTimeout(async () => {
      const qy = query(collection(db, "products"), where("sku", "==", sku.trim()));
      const snaps = await getDocs(qy);
      if (snaps.size > 0) {
        if (!(mode === "edit" && initialData?.id === snaps.docs[0].id)) {
          setSkuError("This SKU already exists. Please use another.");
        } else {
          setSkuError("");
        }
      } else {
        setSkuError("");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [sku]);

  // ----- handlers -----
  const updateVariant = (idx, patch) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  };

  const onVariantINRChange = (idx, inrVal) => {
    const inr = ensureNumber(inrVal);
    const prices = buildPriceFromINR(inr);
    const fake = buildFakePrice(prices);
    updateVariant(idx, { priceINR: inr, prices, fakePriceINR: fake });
  };

  const addVariant = () => {
    const n = variants.length + 1;
    setVariants((v) => [
      ...v,
      {
        id: `var${n}`,
        options: [{ title: "Color", name: `Option ${n}` }],
        priceINR: 0,
        prices: buildPriceFromINR(0),
        fakePriceINR: buildFakePrice({ INR: 0 }),
        stock: 0,
        outOfStock: false,
        images: [],
        attributes: { size: "", weight: "" },
      },
    ]);
  };

  const removeVariant = (idx) => {
    if (!confirm("Remove this variant?")) return;
    setVariants((v) => v.filter((_, i) => i !== idx));
  };

  const setThumb = (vidx, imgIdx) => {
    setVariants((v) =>
      v.map((va, i) =>
        i !== vidx
          ? va
          : {
              ...va,
              images: va.images.map((im, j) => ({ ...im, thumbnail: j === imgIdx })),
            }
      )
    );
  };

  const onUpload = async (vidx, files) => {
    if (!files?.length) return;
    if (!sku) {
      toast.error("Please enter SKU before uploading images.");
      return;
    }
    const uploading = toast.loading("Uploading images...");
    try {
      const uploaded = [];
      for (const f of files) {
        const fp = pathForUpload(sku, variants[vidx].id, f);
        const r = sRef(storage, fp);
        await uploadBytes(r, f);
        const url = await getDownloadURL(r);
        uploaded.push({ url, thumbnail: false });
      }
      setVariants((v) => {
        const copy = [...v];
        copy[vidx] = { ...copy[vidx], images: [...copy[vidx].images, ...uploaded] };
        return copy;
      });
      toast.success("Images uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      toast.dismiss(uploading);
    }
  };

  const deleteImage = async (vidx, imgIdx) => {
    const { url } = variants[vidx].images[imgIdx];
    if (!confirm("Delete this image?")) return;
    const t = toast.loading("Deleting image...");
    try {
      await deleteByUrl(url);
      setVariants((v) => {
        const copy = [...v];
        copy[vidx] = {
          ...copy[vidx],
          images: copy[vidx].images.filter((_, i) => i !== imgIdx),
        };
        return copy;
      });
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      toast.dismiss(t);
    }
  };

  const serialize = () => {
    const media = [];
    variants.forEach((v) => {
      v.images.forEach((im) =>
        media.push({
          url: im.url,
          thumbnail: !!im.thumbnail,
          variant: v.id || "",
        })
      );
    });

    return {
      title: title.trim(),
      subtitle: subtitle.trim(),
      description,
      handle: handle.trim(),
      sku: sku.trim(),
      status,
      categoryId: categoryId || "",
      media,
      variants: variants.map((v) => ({
        id: v.id,
        options: v.options,
        priceINR: round(v.priceINR),
        prices: {
          INR: round(v.prices?.INR),
          USD: round(v.prices?.USD),
          EUR: round(v.prices?.EUR),
          AED: round(v.prices?.AED),
        },
        fakePriceINR: round(v.fakePriceINR),
        stock: round(v.stock),
        images: v.images,
        attributes: v.attributes || {},
      })),
      attributes,
    };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title || !sku) {
      toast.error("Title and SKU are required.");
      return;
    }
    if (skuError) {
      toast.error("Fix SKU error before saving.");
      return;
    }
    if (!categoryId) {
      toast.error("Please choose a category.");
      return;
    }

    if (!confirm(mode === "create" ? "Create this product?" : "Save changes?")) return;

    setSaving(true);
    try {
      const payload = serialize();
      if (mode === "create") {
        const docRef = await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Product added");
        onSaved?.(docRef.id);
      } else {
        const ref = doc(db, "products", initialData.id);
        await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
        toast.success("Product updated");
        onSaved?.(initialData.id);
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteAll = async () => {
    if (mode !== "edit") return;
    if (!confirm("Delete this product and its images?")) return;
    const loading = toast.loading("Deleting product...");
    try {
      const allUrls = [];
      variants.forEach((v) => v.images.forEach((im) => allUrls.push(im.url)));
      await Promise.all(allUrls.map(deleteByUrl));
      await deleteDoc(doc(db, "products", initialData.id));
      toast.success("Deleted product");
      onSaved?.(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      toast.dismiss(loading);
    }
  };

  const mainThumbUrl = useMemo(() => {
    for (const v of variants) {
      const t = v.images.find((i) => i.thumbnail);
      if (t) return t.url;
    }
    for (const v of variants) {
      if (v.images[0]?.url) return v.images[0].url;
    }
    return "";
  }, [variants]);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title, Slug, SKU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Slug</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={handle}
                onChange={(e) => setHandle(slugify(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">Preview: /product/{handle || "slug"}</p>
            </label>

            <label className="block">
              <span className="text-sm font-medium">SKU</span>
              <input
                className={`mt-1 w-full rounded border px-3 py-2 ${
                  skuError ? "border-red-500" : ""
                }`}
                value={sku}
                onChange={(e) => setSku(e.target.value.trim())}
                required
              />
              {skuError && <p className="text-xs text-red-600 mt-1">{skuError}</p>}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Category</span>
              <select
                className="mt-1 w-full rounded border px-3 py-2"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Status</span>
              <select
                className="mt-1 w-full rounded border px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Subtitle</span>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Description</span>
            <textarea
              className="mt-1 w-full rounded border px-3 py-2 min-h-[120px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>

        {/* Live preview */}
        <div className="border rounded p-3">
          <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-3">
            {mainThumbUrl ? (
              <img src={mainThumbUrl} alt="thumb" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-gray-400 text-sm">
                No image
              </div>
            )}
          </div>
          <div className="text-sm">
            <div className="font-semibold">{title || "Product Title"}</div>
            <div className="text-gray-600">{subtitle}</div>
            <div className="mt-2 space-y-1">
              {variants.map((v) => (
                <div key={v.id} className="flex items-center justify-between">
                  <span>
                    {v.options.map((o) => `${o.title}: ${o.name}`).join(", ")}
                  </span>
                  <span className="font-medium">
                    ₹{round(v.prices?.INR)} (MRP ₹{round(v.fakePriceINR)})
                    {v.stock <= 0 && <span className="ml-2 text-red-600">(Out of Stock)</span>}

                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="border rounded p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Variants</h3>
          <button
            type="button"
            onClick={addVariant}
            className="px-3 py-1.5 rounded bg-gray-900 text-white"
          >
            + Add Variant
          </button>
        </div>

        <div className="space-y-6">
          {variants.map((v, idx) => (
            <div key={idx} className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Variant #{idx + 1}</div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {v.options.map((o, oi) => (
                  <label key={oi} className="block">
                    <span className="text-sm">{o.title}</span>
                    <input
                      className="mt-1 w-full rounded border px-3 py-2"
                      value={o.name}
                      onChange={(e) => {
                        const newOpts = [...v.options];
                        newOpts[oi].name = e.target.value;
                        updateVariant(idx, { options: newOpts });
                      }}
                    />
                  </label>
                ))}
              </div>

{/* Pricing & stock */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
  <label className="block">
    <span className="text-sm">INR Price</span>
    <input
      type="number"
      className="mt-1 w-full rounded border px-3 py-2"
      value={v.priceINR}
      onChange={(e) => onVariantINRChange(idx, e.target.value)}
    />
  </label>
  <label className="block">
    <span className="text-sm">Fake MRP</span>
    <input
      type="number"
      className="mt-1 w-full rounded border px-3 py-2"
      value={v.fakePriceINR}
      onChange={(e) => updateVariant(idx, { fakePriceINR: round(e.target.value) })}
    />
  </label>
  <label className="block">
    <span className="text-sm">Stock</span>
    <input
      type="number"
      className="mt-1 w-full rounded border px-3 py-2"
      value={v.stock}
      onChange={(e) => updateVariant(idx, { stock: round(e.target.value) })}
    />
  </label>
</div>

{/* Auto-converted currencies */}
<div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-2 text-sm text-gray-600">
  {CURRENCIES.map((c) => (
    <div key={c}>
      <span className="font-medium">{c}:</span> {round(v.prices?.[c] || 0)}
    </div>
  ))}
</div>


              {/* Variant attributes */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <label className="block">
                  <span className="text-sm">Size</span>
                  <input
                    className="mt-1 w-full rounded border px-3 py-2"
                    value={v.attributes?.size || ""}
                    onChange={(e) =>
                      updateVariant(idx, { attributes: { ...v.attributes, size: e.target.value } })
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-sm">Weight</span>
                  <input
                    className="mt-1 w-full rounded border px-3 py-2"
                    value={v.attributes?.weight || ""}
                    onChange={(e) =>
                      updateVariant(idx, { attributes: { ...v.attributes, weight: e.target.value } })
                    }
                  />
                </label>
              </div>

              {/* Images */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Images</div>
                  <label className="cursor-pointer text-sm px-3 py-1.5 rounded bg-gray-900 text-white">
                    Upload
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => onUpload(idx, e.target.files)}
                      accept="image/*"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-3">
                  {v.images.map((im, j) => (
                    <div key={j} className="relative border rounded overflow-hidden">
                      <img src={im.url} alt="" className="w-full h-28 object-cover" />
                      <div className="absolute left-1 top-1">
                        <button
                          type="button"
                          onClick={() => setThumb(idx, j)}
                          className={`text-xs px-2 py-0.5 rounded ${
                            im.thumbnail ? "bg-green-600 text-white" : "bg-white"
                          }`}
                        >
                          {im.thumbnail ? "Thumbnail" : "Make Thumb"}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteImage(idx, j)}
                        className="absolute right-1 top-1 text-xs px-2 py-0.5 rounded bg-white/90"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {!v.images.length && (
                    <div className="col-span-2 md:col-span-6 text-sm text-gray-500">
                      No images yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global attributes */}
      <div className="border rounded p-3 space-y-3">
        <h3 className="font-semibold">Attributes (Global, Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.keys(attributes).map((key) => (
            <label key={key} className="block">
              <span className="text-sm capitalize">{key}</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={attributes[key]}
                onChange={(e) => setAttributes({ ...attributes, [key]: e.target.value })}
              />
            </label>
          ))}
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded bg-emerald-700 text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : mode === "create" ? "Add Product" : "Save Changes"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={onDeleteAll}
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            Delete Product
          </button>
        )}
      </div>
    </form>
  );
}
