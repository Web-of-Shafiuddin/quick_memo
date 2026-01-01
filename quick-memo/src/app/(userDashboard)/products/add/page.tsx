"use client";
import { useRouter } from "next/navigation";
import ProductForm, { ProductFormSubmitData } from "../_components/ProductForm";
import { productService } from "@/services/productService";
import { toast } from "sonner";

export default function AddProductPage() {
  const router = useRouter();

  const handleCreate = async (data: ProductFormSubmitData) => {
    try {
      const response = await productService.create(data as any); // Service expects CreateProductInput, but current data is compatible
      toast.success("Product created successfully");
      router.push(`/products/edit/${response.data.product_id}`);
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error(error.response?.data?.error || "Failed to create product");
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
