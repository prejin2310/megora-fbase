"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProductForm from "@/components/admin/ProductForm";
import { card, cardBody, sectionTitle } from "@/components/admin/ui";

export default function AddProductPage() {
  const router = useRouter();

  const handleAdd = async (product) => {
    try {
      await addDoc(collection(db, "products"), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Product added 🎉");
      router.push("/admin/products");
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className={`${card} max-w-5xl mx-auto`}>
        <div className={cardBody}>
          <h1 className={sectionTitle + " mb-6"}>Add Product</h1>
          <ProductForm onSubmit={handleAdd} submitLabel="Save Product" />
        </div>
      </div>
    </div>
  );
}
