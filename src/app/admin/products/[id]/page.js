"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductForm from "@/components/admin/ProductForm";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (!snap.exists()) {
          toast.error("Product not found");
          router.replace("/admin/products");
          return;
        }
        setData({ id: snap.id, ...snap.data() });
      } catch (e) {
        console.error(e);
        toast.error("Failed to load");
        router.replace("/admin/products");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]); // eslint-disable-line

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-4">Edit: {data?.title}</h1>
      <ProductForm
        mode="edit"
        initialData={data}
        onSaved={(pid) => {
          if (!pid) {
            // deleted
            router.push("/admin/products");
          } else {
            // stay on page
          }
        }}
      />
    </div>
  );
}
