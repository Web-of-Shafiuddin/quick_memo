"use client";
import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { productService, Product } from "@/services/productService";
import { useCurrency } from "@/hooks/useCurrency";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState<PaginationState | null>(null);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const { format: formatPrice } = useCurrency();

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const fetchProducts = async (currentPage: number = page) => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit,
        sortBy,
        sortOrder,
      };
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.status = filterStatus;
      const response = await productService.getAll(params);
      setProducts(response.data);
      setPagination(response.pagination || null);
    } catch (error: unknown) {
      console.error("Error fetching products:", error);
      const message =
        error instanceof Error
          ? (error as any).response?.data?.error
          : "Failed to fetch products";
      alert(message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProducts(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
    fetchProducts(1);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value as "ASC" | "DESC");
    setPage(1);
    fetchProducts(1);
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    setPage(1);
    fetchProducts(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchProducts(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    );
    if (isConfirmed) {
      try {
        await productService.delete(id);
        alert("Product deleted successfully");
        fetchProducts();
      } catch (error: unknown) {
        console.error("Error deleting product:", error);
        const message =
          error instanceof Error
            ? (error as any).response?.data?.error
            : "Failed to delete product";
        alert(message || "Failed to delete product");
      }
    }
  };

  const totalStockValue = products.reduce((acc, product) => {
    return acc + product.price * product.stock;
  }, 0);

  const getStatusBadgeVariant = (status: Product["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "secondary";
      case "DISCONTINUED":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product List</h1>
          {pagination && (
            <p className="text-sm text-muted-foreground">
              {pagination.total} total products
            </p>
          )}
        </div>
        <Link href="/products/add">
          <Button>Add New Product</Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="max-w-sm"
          />
          <Button onClick={handleSearch} variant="outline">Search</Button>
          {searchTerm && (
            <Button onClick={() => { setSearchTerm(""); setPage(1); fetchProducts(1); }} variant="ghost">
              Clear
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
              <SelectItem value="sku">SKU</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={handleSortOrderChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">Desc</SelectItem>
              <SelectItem value="ASC">Asc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableCaption>
          A list of all your products, including their stock levels and value.
        </TableCaption>
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
            <TableRow key={product.product_id}>
              <TableCell>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center text-xs">
                    No Image
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{product.sku}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{product.name}</span>
                  {product.variant_count && product.variant_count > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {product.variant_count}{" "}
                      {product.variant_count === 1 ? "variant" : "variants"}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>{product.category_name || "N/A"}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(product.status)}>
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell className="text-right">
                {formatPrice(product.price)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/products/edit/${product.product_id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDelete(product.product_id, product.name)
                    }
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
              {formatPrice(totalStockValue)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === pagination.totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
