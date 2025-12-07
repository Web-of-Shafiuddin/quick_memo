'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
}

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    category: product?.category || '',
    stock: product?.stock || '',
    supplier: product?.supplier || '',
    costPrice: product?.costPrice || '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', String(formData.price));
    data.append('category', formData.category);
    data.append('stock', String(formData.stock));
    data.append('supplier', formData.supplier);
    data.append('costPrice', String(formData.costPrice));
    if (file) {
      data.append('image', file);
    }
    if (product) {
      data.append('id', product.id);
    }

    try {
      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Product ${product ? 'updated' : 'created'} successfully`);
        onSaved();
      } else {
        toast.error(`Failed to ${product ? 'update' : 'create'} product`);
      }
    } catch (error) {
      toast.error(`An error occurred while ${product ? 'updating' : 'creating'} the product`);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" value={formData.category} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Input id="supplier" name="supplier" value={formData.supplier} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="costPrice">Cost Price</Label>
            <Input id="costPrice" name="costPrice" type="number" value={formData.costPrice} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="image">Product Image</Label>
            <Input id="image" name="image" type="file" onChange={handleFileChange} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
