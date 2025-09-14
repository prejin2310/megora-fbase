"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import ProductForm from "../../../../components/admin/ProductForm";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          setInitialData(snap.data());
        } else {
          toast.error("Product not found");
          router.push("/admin/products");
        }
      } catch (err) {
        toast.error("Error loading product");
      }
    };
    fetchProduct();
  }, [id, router]);

  const handleUpdate = async (product) => {
    try {
      await updateDoc(doc(db, "products", id), {
        ...product,
        updatedAt: serverTimestamp(),
      });
      toast.success("Product updated 🎉");
      router.push("/admin/products");
    } catch (err) {
      toast.error("Update failed: " + err.message);
    }
  };

  if (!initialData) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-brand mb-6">Edit Product</h1>
      <ProductForm
        initialData={initialData}
        onSubmit={handleUpdate}
        submitLabel="Update Product"
      />
    </div>
  );
}
