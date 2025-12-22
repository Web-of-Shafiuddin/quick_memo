'use client'
import { useRouter } from "next/navigation";
import ProductForm from "../_components/ProductForm";
import { productService } from "@/services/productService";

export default function AddProductPage() {
  const router = useRouter();

  const handleCreate = async (data: any) => {
    try {
      await productService.create(data);
      alert('Product created successfully');
      router.push('/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw new Error(error.response?.data?.error || 'Failed to create product');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <ProductForm
        onSubmit={handleCreate}
        title="Add New Product"
        description="Create a new product for your inventory."
        submitButtonText="Create Product"
      />
    </div>
  );
}
