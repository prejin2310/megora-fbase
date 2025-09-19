"use client";

import ProductForm from "@/components/admin/ProductForm";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddProductPage() {
  const router = useRouter();

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-4">Add Product</h1>
      <ProductForm
        mode="create"
        onSaved={(id) => {
          if (id) {
            router.push(`/admin/products/${id}`);
          } else {
            // deleted immediately (edge case)
            router.push("/admin/products");
          }
        }}
      />
      <p className="text-xs text-gray-500 mt-6">
        • SKU must be unique • Slug auto-generates from title • Prices auto-convert from INR • Fake
        price = +40% (editable)
      </p>
    </div>
  );
}
