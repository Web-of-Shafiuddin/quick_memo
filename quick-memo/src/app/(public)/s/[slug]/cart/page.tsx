"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Trash2,
  AlertCircle,
  Phone,
  MapPin,
  User,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku: string;
  variant_info?: string;
}

export default function CartPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { format: formatPrice } = useCurrency();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({
    name: "",
    mobile: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Load cart
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem("shop_cart") || "[]");
      setCart(savedCart);
    };
    loadCart();

    window.addEventListener("cart-updated", loadCart);
    return () => window.removeEventListener("cart-updated", loadCart);
  }, []);

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
    localStorage.setItem("shop_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const removeItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem("shop_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!customer.name || !customer.mobile || !customer.address) {
      toast.error("Please fill in all details");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/shop/${slug}/orders`, {
        ...customer,
        customer_name: customer.name,
        customer_mobile: customer.mobile,
        customer_address: customer.address,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });

      if (res.data.success) {
        setOrderComplete(true);
        setOrderId(res.data.transaction_id);
        localStorage.removeItem("shop_cart");
        window.dispatchEvent(new Event("cart-updated"));
        toast.success("Order placed successfully!");
      }
    } catch (error: any) {
      console.error("Order failed:", error);
      toast.error(error.response?.data?.error || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6 animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Order Placed!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. Your Order ID is{" "}
          <span className="font-mono font-medium text-foreground">
            #{orderId}
          </span>
          . We will contact you shortly.
        </p>
        <Button onClick={() => router.push(`/s/${slug}`)} className="w-full">
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground">
          Add some products to get started.
        </p>
        <Button onClick={() => router.push(`/s/${slug}`)}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Cart Items */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Shopping Cart{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({cart.length} items)
          </span>
        </h2>
        <div className="space-y-4">
          {cart.map((item, index) => (
            <Card
              key={`${item.product_id}-${index}`}
              className="flex flex-row overflow-hidden"
            >
              <div className="w-24 h-24 bg-gray-100 shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No Img
                  </div>
                )}
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate pr-2">{item.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {item.variant_info && (
                    <p className="text-xs text-muted-foreground">
                      {item.variant_info}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2 border rounded-md">
                    <button
                      className="px-2 py-1 hover:bg-gray-100"
                      onClick={() => updateQuantity(index, -1)}
                    >
                      -
                    </button>
                    <span className="text-sm w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      className="px-2 py-1 hover:bg-gray-100"
                      onClick={() => updateQuantity(index, 1)}
                    >
                      +
                    </button>
                  </div>
                  <p className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-green-600">Free</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checkout Form */}
      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              id="checkout-form"
              onSubmit={placeOrder}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-9"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobile"
                    placeholder="017..."
                    className="pl-9"
                    value={customer.mobile}
                    onChange={(e) =>
                      setCustomer({ ...customer, mobile: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="House 123, Road 4..."
                    className="pl-9"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              form="checkout-form"
              className="w-full text-lg h-12"
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Confirm & Order"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
