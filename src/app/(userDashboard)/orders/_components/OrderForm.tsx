"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Order } from "../actions";

interface OrderFormProps {
  order?: Order | null;
  formAction: (prevState: any, formData: FormData) => Promise<any>;
  title: string;
  description: string;
  submitButtonText: string;
}

const OrderForm = ({ order, formAction, title, description, submitButtonText }: OrderFormProps) => {
  const router = useRouter();
  const [state, formActionWithState] = useFormState(formAction, null);

  useEffect(() => {
    if (state?.redirect) {
      router.push(state.redirect);
    }
  }, [state, router]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formActionWithState} className="space-y-6">
          {order && <input type="hidden" name="id" value={order.id} />}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">Order ID</Label>
              <Input
                id="id"
                name="id"
                value={order?.id || "Auto-generated"}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                name="customerName"
                defaultValue={order?.customerName || ""}
                placeholder="e.g., John Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              defaultValue={order?.customerEmail || ""}
              placeholder="e.g., john.doe@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Order Status</Label>
            <Select name="status" defaultValue={order?.status || "Pending"} required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Note: A full order form would include a dynamic list of items here. */}
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> For simplicity, adding/editing order items is not included in this example. In a real application, this would be a more complex section.
            </p>
          </div>

          {state?.message && <p className="text-green-600">{state.message}</p>}
          {state?.error && <p className="text-red-600">{state.error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">{submitButtonText}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderForm;