'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

interface ShopProfile {
    id?: string;
    shopName: string;
    ownerName: string;
    mobile: string;
    address?: string;
    logoUrl?: string;
    theme: string;
    isPro: boolean;
    proExpiry: string;
    bkashNumber?: string;
}

interface CustomerInfo {
    name: string;
    mobile: string;
    address: string;
    note: string;
}

interface MemoData {
    shopProfile: ShopProfile;
    customer: CustomerInfo;
    products: Product[];
    deliveryCharge: number;
    discount: number;
    paymentMethod: 'cod' | 'paid';
    subtotal: number;
    totalAmount: number;
}

interface CashMemoFormProps {
    memoData: MemoData;
    onUpdate: (data: Partial<MemoData>) => void;
}

const CashMemoForm: React.FC<CashMemoFormProps> = ({ memoData, onUpdate }) => {
    const [shopProfile, setShopProfile] = useState<ShopProfile>(memoData.shopProfile);
    const [customer, setCustomer] = useState<CustomerInfo>(memoData.customer);
    const [products, setProducts] = useState<Product[]>(memoData.products);
    const [deliveryCharge, setDeliveryCharge] = useState(memoData.deliveryCharge);
    const [discount, setDiscount] = useState(memoData.discount);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'paid'>(memoData.paymentMethod);
    const [savedProducts, setSavedProducts] = useState<Product[]>([]);

    // Update parent component when data changes
    useEffect(() => {
        const updatedData: Partial<MemoData> = {
            shopProfile,
            customer,
            products,
            deliveryCharge,
            discount,
            paymentMethod,
            subtotal: calculateSubtotal(),
            totalAmount: calculateTotal()
        };
        onUpdate(updatedData);
    }, [shopProfile, customer, products, deliveryCharge, discount, paymentMethod]);

    // Load saved data from localStorage on mount
    useEffect(() => {
        const savedProfile = localStorage.getItem('shopProfile');
        const savedProductsList = localStorage.getItem('savedProducts');

        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            setShopProfile(profile);
        }

        if (savedProductsList) {
            setSavedProducts(JSON.parse(savedProductsList));
        }
    }, []);

    // Save shop profile to localStorage (frontend-only)
    const saveShopProfile = () => {
        try {
            localStorage.setItem('shopProfile', JSON.stringify(shopProfile));
            toast.success('Shop profile saved locally!');
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save profile');
        }
    };

    // Calculate totals
    const calculateSubtotal = () => {
        return products.reduce((sum, product) => sum + product.total, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal + deliveryCharge - discount;
    };

    // Update product total when quantity or price changes
    const updateProduct = (id: string, field: keyof Product, value: string | number) => {
        setProducts(prev => prev.map(product => {
            if (product.id === id) {
                const updated = { ...product, [field]: value };
                if (field === 'quantity' || field === 'price') {
                    updated.total = updated.quantity * updated.price;
                }
                return updated;
            }
            return product;
        }));
    };

    // Add new product row
    const addProduct = () => {
        const newProduct: Product = {
            id: Date.now().toString(),
            name: '',
            quantity: 1,
            price: 0,
            total: 0
        };
        setProducts(prev => [...prev, newProduct]);
    };

    // Remove product row
    const removeProduct = (id: string) => {
        if (products.length > 1) {
            setProducts(prev => prev.filter(product => product.id !== id));
        }
    };

    // Add product from saved list
    const addSavedProduct = (savedProduct: Product) => {
        const newProduct = {
            ...savedProduct,
            id: Date.now().toString(),
            quantity: 1,
            total: savedProduct.price
        };
        setProducts(prev => [...prev, newProduct]);
    };

    // Save current product to saved list
    const saveCurrentProduct = (product: Product) => {
        if (product.name && product.price > 0) {
            const savedProduct = { ...product, id: Date.now().toString() };
            const updated = [...savedProducts, savedProduct];
            setSavedProducts(updated);
            localStorage.setItem('savedProducts', JSON.stringify(updated));
            toast.success(`"${product.name}" saved to product list!`);
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Shop Profile Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Shop Information</CardTitle>
                        <Button onClick={saveShopProfile} size="sm" variant="outline">
                            <Save className="w-4 h-4 mr-2" />
                            Save Profile
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="shopName">Shop Name *</Label>
                            <Input
                                id="shopName"
                                value={shopProfile.shopName}
                                onChange={(e) => setShopProfile(prev => ({ ...prev, shopName: e.target.value }))}
                                placeholder="Enter your shop name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="ownerName">Owner Name *</Label>
                            <Input
                                id="ownerName"
                                value={shopProfile.ownerName}
                                onChange={(e) => setShopProfile(prev => ({ ...prev, ownerName: e.target.value }))}
                                placeholder="Enter owner name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="mobile">Mobile Number *</Label>
                            <Input
                                id="mobile"
                                value={shopProfile.mobile}
                                onChange={(e) => setShopProfile(prev => ({ ...prev, mobile: e.target.value }))}
                                placeholder="01xxxxxxxxx"
                            />
                        </div>
                        <div>
                            <Label htmlFor="address">Shop Address</Label>
                            <Input
                                id="address"
                                value={shopProfile.address}
                                onChange={(e) => setShopProfile(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Enter shop address"
                            />
                        </div>
                        <div>
                            <Label htmlFor="bkashNumber">Bkash Number</Label>
                            <Input
                                id="bkashNumber"
                                value={shopProfile.bkashNumber}
                                onChange={(e) => setShopProfile(prev => ({ ...prev, bkashNumber: e.target.value }))}
                                placeholder="01xxxxxxxxx"
                            />
                        </div>
                        <div>
                            <Label htmlFor="theme">Theme Color</Label>
                            <Select value={shopProfile.theme} onValueChange={(value) => setShopProfile(prev => ({ ...prev, theme: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default (Slate)</SelectItem>
                                    <SelectItem value="blue">Blue</SelectItem>
                                    <SelectItem value="green">Green</SelectItem>
                                    <SelectItem value="purple">Purple</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Customer Information Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="customerName">Customer Name *</Label>
                            <Input
                                id="customerName"
                                value={customer.name}
                                onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter customer name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="customerMobile">Customer Mobile *</Label>
                            <Input
                                id="customerMobile"
                                value={customer.mobile}
                                onChange={(e) => setCustomer(prev => ({ ...prev, mobile: e.target.value }))}
                                placeholder="01xxxxxxxxx"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="customerAddress">Delivery Address</Label>
                        <Textarea
                            id="customerAddress"
                            value={customer.address}
                            onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Enter complete delivery address"
                            rows={2}
                        />
                    </div>
                    <div>
                        <Label htmlFor="orderNote">Order Note (Optional)</Label>
                        <Textarea
                            id="orderNote"
                            value={customer.note}
                            onChange={(e) => setCustomer(prev => ({ ...prev, note: e.target.value }))}
                            placeholder="Any special instructions or notes"
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Products Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Products</CardTitle>
                        <Button onClick={addProduct} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Saved Products (Pro Feature) */}
                    {shopProfile.isPro && savedProducts.length > 0 && (
                        <div className="mb-4">
                            <Label className="text-sm font-medium">Saved Products (Quick Add)</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {savedProducts.map((product) => (
                                    <Badge
                                        key={product.id}
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => addSavedProduct(product)}
                                    >
                                        {product.name} - ৳{product.price}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Products Table */}
                    <div className="space-y-2">
                        {products.map((product) => (
                            <div key={product.id} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-12 md:col-span-5">
                                    <Input
                                        value={product.name}
                                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                                        placeholder="Product name"
                                    />
                                </div>
                                <div className="col-span-3 md:col-span-2">
                                    <Input
                                        type="number"
                                        value={product.quantity}
                                        onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 0)}
                                        placeholder="Qty"
                                        min="1"
                                    />
                                </div>
                                <div className="col-span-3 md:col-span-2">
                                    <Input
                                        type="number"
                                        value={product.price}
                                        onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                                        placeholder="Price"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">৳{product.total.toFixed(2)}</span>
                                        {shopProfile.isPro && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => saveCurrentProduct(product)}
                                                disabled={!product.name || product.price <= 0}
                                            >
                                                <Save className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeProduct(product.id)}
                                        disabled={products.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Payment & Delivery Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Payment & Delivery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="deliveryCharge">Delivery Charge</Label>
                            <Input
                                id="deliveryCharge"
                                type="number"
                                value={deliveryCharge}
                                onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <Label htmlFor="discount">Discount</Label>
                            <Input
                                id="discount"
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={(value: 'cod' | 'paid') => setPaymentMethod(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                                    <SelectItem value="paid">Already Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-medium">৳{calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Charge:</span>
                                <span className="font-medium">৳{deliveryCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount:</span>
                                <span className="font-medium text-red-600">-৳{discount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Total Amount:</span>
                                <span>৳{calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pro Features Banner */}
            {!shopProfile.isPro && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Crown className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="font-medium">Upgrade to Pro</p>
                                    <p className="text-sm text-muted-foreground">
                                        Save products, upload logo, remove watermark, and more!
                                    </p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => {
                                    setShopProfile(prev => ({ ...prev, isPro: true }));
                                    toast.success('Pro features enabled for demo!');
                                }}
                            >
                                Try Pro Features
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CashMemoForm;
