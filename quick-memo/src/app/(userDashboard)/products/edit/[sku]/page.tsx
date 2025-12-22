'use client'
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm from "../../_components/ProductForm";
import { productService, Product } from "@/services/productService";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.sku as string; // This is actually product_id now
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getById(parseInt(id));
      setProduct(response.data);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      alert(error.response?.data?.error || 'Failed to fetch product');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await productService.update(parseInt(id), data);
      alert('Product updated successfully');
      router.push('/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw new Error(error.response?.data?.error || 'Failed to update product');
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  if (!product) {
    return <div className="container mx-auto py-10">Product not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <ProductForm
        product={product}
        onSubmit={handleUpdate}
        title="Edit Product"
        description="Update the details for your product."
        submitButtonText="Update Product"
      />
    </div>
  );
}
