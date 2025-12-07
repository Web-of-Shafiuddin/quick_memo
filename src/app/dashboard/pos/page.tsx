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
  price: number;
}

interface Customer {
  id: string;
  name: string;
  mobile: string;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const savedDrafts = localStorage.getItem('drafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
  };

  const saveDraft = () => {
    const newDraft = { cart, selectedCustomer };
    const updatedDrafts = [...drafts, newDraft];
    setDrafts(updatedDrafts);
    localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
    setCart([]);
    setSelectedCustomer(null);
  };

  const loadDraft = (draft: any) => {
    setCart(draft.cart);
    setSelectedCustomer(draft.selectedCustomer);
    const updatedDrafts = drafts.filter(d => d !== draft);
    setDrafts(updatedDrafts);
    localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
  };

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

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const result = await response.json();
      if (result.success) {
        setCustomers(result.customers);
      } else {
        toast.error('Failed to fetch customers');
      }
    } catch (error) {
      toast.error('An error occurred while fetching customers');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.mobile.includes(customerSearch)
  );

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Point of Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Input
                placeholder="Search for customer by mobile..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>
            {customerSearch && (
              <div className="mt-4">
                {filteredCustomers.map(customer => (
                  <div key={customer.id} onClick={() => {
                    setSelectedCustomer(customer);
                    setCustomerSearch('');
                  }} className="cursor-pointer p-2 border rounded">
                    <p>{customer.name} - {customer.mobile}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 grid grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <Card key={product.id} onClick={() => addToCart(product)} className="cursor-pointer">
                  <CardContent className="p-4">
                    <p className="font-semibold">{product.name}</p>
                    <p>৳{product.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Cart</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCustomer && (
              <div className="mb-4">
                <p className="font-semibold">{selectedCustomer.name}</p>
                <p>{selectedCustomer.mobile}</p>
              </div>
            )}
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between">
                <p>{item.name}</p>
                <p>৳{item.price}</p>
              </div>
            ))}
            <Button className="mt-4 w-full" onClick={saveDraft}>Hold</Button>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Input placeholder="Cash" type="number" />
              <Input placeholder="Bkash" type="number" />
            </div>
            <Button className="mt-4 w-full" onClick={() => console.log('Payment processed')}>Pay</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            {drafts.map((draft, index) => (
              <div key={index} onClick={() => loadDraft(draft)} className="cursor-pointer p-2 border rounded mb-2">
                <p>{draft.selectedCustomer?.name || 'No customer'}</p>
                <p>{draft.cart.length} items</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
