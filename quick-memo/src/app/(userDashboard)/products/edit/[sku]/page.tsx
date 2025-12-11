import { notFound } from "next/navigation";

import ProductForm from "../../_components/ProductForm"; // We will create this shared component next
import { getProductBySku, updateProduct } from "../../action";

// This is a Server Component that fetches the data
// and passes it as a prop to the client form.
export default async function EditProductPage({ params }: { params: { sku: string } }) {
  const product = await getProductBySku(params.sku);

  console.log("Product:", product, "sku: ", params.sku);

  // If no product is found, show the 404 page
  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <ProductForm 
        product={product} 
        formAction={updateProduct}
        title="Edit Product"
        description="Update the details for your product."
        submitButtonText="Update Product"
      />
    </div>
  );
}