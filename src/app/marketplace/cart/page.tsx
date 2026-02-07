'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Store as StoreIcon,
  Verified,
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

interface CartItem {
  product_id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  shop_name: string;
  shop_slug: string;
  is_verified: boolean;
  has_badge: boolean;
  quantity: number;
  seller_id: string;
}

interface SellerGroup {
  seller_id: string;
  shop_name: string;
  shop_slug: string;
  is_verified: boolean;
  has_badge: boolean;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
}

const SHIPPING_FEE_PER_SELLER = 60; // ৳60 per seller

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const cartData = JSON.parse(localStorage.getItem('marketplace_cart') || '[]');
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const saveCart = (updatedCart: CartItem[]) => {
    localStorage.setItem('marketplace_cart', JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  const updateQuantity = (sku: string, newQuantity: number) => {
    const item = cart.find(item => item.sku === sku);

    if (item && newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items available in stock`);
      return;
    }

    if (newQuantity <= 0) {
      removeItem(sku);
      return;
    }

    const updatedCart = cart.map(item =>
      item.sku === sku ? { ...item, quantity: newQuantity } : item
    );
    saveCart(updatedCart);
  };

  const removeItem = (sku: string) => {
    const updatedCart = cart.filter(item => item.sku !== sku);
    saveCart(updatedCart);
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    localStorage.removeItem('marketplace_cart');
    setCart([]);
    toast.success('Cart cleared');
  };

  // Group items by seller
  const groupedBySeller: SellerGroup[] = React.useMemo(() => {
    const groups: { [key: string]: SellerGroup } = {};

    cart.forEach(item => {
      const sellerId = item.shop_slug;

      if (!groups[sellerId]) {
        groups[sellerId] = {
          seller_id: sellerId,
          shop_name: item.shop_name,
          shop_slug: item.shop_slug,
          is_verified: item.is_verified,
          has_badge: item.has_badge,
          items: [],
          subtotal: 0,
          shippingFee: SHIPPING_FEE_PER_SELLER,
        };
      }

      groups[sellerId].items.push(item);
      groups[sellerId].subtotal += item.price * item.quantity;
    });

    return Object.values(groups);
  }, [cart]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = groupedBySeller.reduce((sum, group) => sum + group.subtotal, 0);
  const totalShipping = groupedBySeller.length * SHIPPING_FEE_PER_SELLER;
  const grandTotal = totalPrice + totalShipping;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
            <Link href="/marketplace">
              <Button>
                <StoreIcon className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Shopping Cart
        </h1>
        <Button variant="outline" onClick={clearCart}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      {/* Multi-Seller Warning */}
      {groupedBySeller.length > 1 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Multiple Sellers Notice:</strong> You're ordering from {groupedBySeller.length} different shops.
            Each shop will ship separately, so you'll receive {groupedBySeller.length} separate deliveries.
            Total Delivery Fee: ৳{totalShipping.toLocaleString()} ({groupedBySeller.map((_, i) => `৳${SHIPPING_FEE_PER_SELLER}`).join(' + ')})
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items - Grouped by Seller */}
        <div className="lg:col-span-2 space-y-6">
          {groupedBySeller.map((group) => (
            <Card key={group.seller_id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Link href={`/shop/${group.shop_slug}`}>
                    <CardTitle className="text-lg flex items-center gap-2 hover:text-primary cursor-pointer">
                      <StoreIcon className="h-5 w-5" />
                      {group.shop_name}
                      {group.is_verified && (
                        <Verified className="h-4 w-4 text-blue-500" />
                      )}
                      {group.has_badge && (
                        <Badge variant="secondary" className="ml-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </CardTitle>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.sku} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <StoreIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link href={`/marketplace/products/${item.sku}`}>
                        <h3 className="font-semibold line-clamp-2 hover:text-primary">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        ৳{item.price.toLocaleString()} each
                      </p>
                      {item.stock < 10 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Only {item.stock} left!
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="font-bold text-lg">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeItem(item.sku)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/50">
                <span className="font-medium">Seller Subtotal:</span>
                <span className="font-bold">৳{group.subtotal.toLocaleString()}</span>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items ({totalItems}):</span>
                <span className="font-medium">৳{totalPrice.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Shipping ({groupedBySeller.length} {groupedBySeller.length === 1 ? 'seller' : 'sellers'}):
                </span>
                <span className="font-medium">৳{totalShipping.toLocaleString()}</span>
              </div>

              {groupedBySeller.length > 1 && (
                <div className="text-xs text-muted-foreground pl-4">
                  {groupedBySeller.map((group, index) => (
                    <div key={group.seller_id}>
                      • {group.shop_name}: ৳{SHIPPING_FEE_PER_SELLER}
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold text-primary">
                  ৳{grandTotal.toLocaleString()}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Link href="/marketplace/checkout" className="w-full">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/marketplace" className="w-full">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
