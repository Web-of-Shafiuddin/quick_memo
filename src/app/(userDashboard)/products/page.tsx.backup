'use client'
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge"; // Assuming you have this component

// Define a more accurate Product type
type Product = {
  sku: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};

const ProductsPage = () => {
  // Use useState to make the list dynamic (e.g., for deleting items)
  const [products, setProducts] = useState<Product[]>([
    {
      sku: "SKU001",
      name: "Wireless Mouse",
      price: 25.00,
      stock: 50,
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&h=150&fit=crop&crop=center",
      status: "In Stock",
    },
    {
      sku: "SKU002",
      name: "Mechanical Keyboard",
      price: 120.00,
      stock: 5,
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1596464616907-38b77d0a9a41?w=150&h=150&fit=crop&crop=center",
      status: "Low Stock",
    },
    {
      sku: "SKU003",
      name: "Ergonomic Office Chair",
      price: 350.00,
      stock: 0,
      category: "Furniture",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      status: "Out of Stock",
    },
    {
      sku: "SKU004",
      name: "4K Monitor",
      price: 450.00,
      stock: 20,
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=150&h=150&fit=crop&crop=center",
      status: "In Stock",
    },
    {
      sku: "SKU005",
      name: "Standing Desk",
      price: 550.00,
      stock: 12,
      category: "Furniture",
      image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=150&h=150&fit=crop&crop=center",
      status: "In Stock",
    },
  ]);

  // Handle product deletion
  const handleDelete = (sku: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete product ${sku}?`);
    if (isConfirmed) {
      setProducts(products.filter(p => p.sku !== sku));
    }
  };

  // Calculate total value of products in stock
  const totalStockValue = products.reduce((acc, product) => {
    return acc + (product.price * product.stock);
  }, 0);

  // Helper function to get badge variant based on status
  const getStatusBadgeVariant = (status: Product['status']) => {
    switch (status) {
      case "In Stock":
        return "default"; // Green
      case "Low Stock":
        return "secondary"; // Yellow/Orange
      case "Out of Stock":
        return "destructive"; // Red
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Product List</h1>
        <Link href="/products/add">
          <Button>Add New Product</Button>
        </Link>
      </div>

      <Table>
        <TableCaption>A list of all your products, including their stock levels and value.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.sku}>
              <TableCell>
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-10 w-10 rounded-md object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{product.sku}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(product.status)}>
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/products/edit/${product.sku}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(product.sku)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>Total Stock Value</TableCell>
            <TableCell className="text-right font-semibold">
              ${totalStockValue.toFixed(2)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default ProductsPage;