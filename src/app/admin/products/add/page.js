"use client";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProductForm from "../../../../components/admin/ProductForm";

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
    <div className="p-6 bg-white rounded-lg shadow max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-brand mb-6">Add Product</h1>
      <ProductForm onSubmit={handleAdd} submitLabel="Save Product" />
    </div>
  );
}
