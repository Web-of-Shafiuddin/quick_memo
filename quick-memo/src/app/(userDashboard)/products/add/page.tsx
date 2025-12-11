import ProductForm from "../_components/ProductForm";
import { createProduct } from "../action";

const ProductAddPage = () => {
  return (
    <div className="container mx-auto py-10">
      <ProductForm 
        formAction={createProduct}
        title="Add New Product"
        description="Fill in the details below to create a new product for your inventory."
        submitButtonText="Create Product"
      />
    </div>
  );
};

export default ProductAddPage;