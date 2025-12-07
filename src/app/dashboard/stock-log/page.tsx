'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
}

export default function StockLogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [adjustment, setAdjustment] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      if (result.success) {
        setProducts(result.products);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      toast.error('An error occurred while fetching products');
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/stock-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: selectedProduct, adjustment }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Stock adjusted successfully');
        setAdjustment(0);
      } else {
        toast.error('Failed to adjust stock');
      }
    } catch (error) {
      toast.error('An error occurred while adjusting stock');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Stock Adjustment Log</h1>
      <Card>
        <CardHeader>
          <CardTitle>Adjust Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="product">Product</Label>
            <select
              id="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="adjustment">Adjustment</Label>
            <Input
              id="adjustment"
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value))}
            />
          </div>
          <Button onClick={handleSave}>Save Adjustment</Button>
        </CardContent>
      </Card>
    </div>
  );
}
