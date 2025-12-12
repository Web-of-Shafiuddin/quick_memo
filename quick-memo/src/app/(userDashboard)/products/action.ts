"use server";

// Define a Product type for type safety
export type Product = {
  sku: string;
  name: string;
  category: string;
  price: number;
  discount: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  image: string;
};

// This is a mock database. In a real app, you'd fetch from a real DB.
// Let's pre-populate it with some data to make testing easier.
const mockProducts: Product[] = [
  {
    sku: "SKU001",
    name: "Wireless Mouse",
    price: 25.0,
    discount: 0,
    stock: 50,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&h=150&fit=crop&crop=center",
    status: "In Stock",
  },
  {
    sku: "SKU002",
    name: "Mechanical Keyboard",
    price: 120.0,
    discount: 10,
    stock: 5,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1596464616907-38b77d0a9a41?w=150&h=150&fit=crop&crop=center",
    status: "Low Stock",
  },
];

// --- Server Action for CREATING a product ---
export async function createProduct<T>(prevState: T, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

  const product = {
    sku: formData.get("sku") as string,
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    price: parseFloat(formData.get("price") as string),
    discount: parseInt(formData.get("discount") as string, 10) || 0,
    stock: parseInt(formData.get("stock") as string, 10),
    status: formData.get("status") as Product['status'],
    image: formData.get("image") as string,
  };

  if (!product.sku || !product.name || product.price < 0 || product.stock < 0) {
    return { error: "Please fill in all required fields with valid data." };
  }

  console.log("New product created:", product);
  mockProducts.push(product);

  return { message: `Product "${product.name}" created successfully!`, redirect: "/products" };
}

// --- Server Action for UPDATING a product ---
export async function updateProduct<T>(prevState: T, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

  const sku = formData.get("sku") as string;
  const productIndex = mockProducts.findIndex(p => p.sku === sku);

  if (productIndex === -1) {
    return { error: `Product with SKU ${sku} not found.` };
  }

  const updatedProduct = {
    ...mockProducts[productIndex], // Keep existing data
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    price: parseFloat(formData.get("price") as string),
    discount: parseInt(formData.get("discount") as string, 10) || 0,
    stock: parseInt(formData.get("stock") as string, 10),
    status: formData.get("status") as Product['status'],
    image: formData.get("image") as string,
  };
  
  mockProducts[productIndex] = updatedProduct;

  console.log("Product updated:", updatedProduct);
  return { message: `Product "${updatedProduct.name}" updated successfully!`, redirect: "/products" };
}

// --- Helper function to find a product (for pre-filling the form) ---
export async function getProductBySku(sku: string): Promise<Product | null> {
  // In a real app, this would be a database query: db.product.findUnique({ where: { sku } })
  return mockProducts.find(p => p.sku === sku) || null;
}