"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethodStatus,
  type PaymentMethod,
} from "@/services/paymentMethodService";

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newMethodName, setNewMethodName] = useState("");
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [editName, setEditName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await getPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleCreate = async () => {
    if (!newMethodName.trim()) {
      toast.error("Please enter a payment method name");
      return;
    }

    setSubmitting(true);
    try {
      const newMethod = await createPaymentMethod(newMethodName.trim());
      setPaymentMethods((prev) => [...prev, newMethod]);
      setNewMethodName("");
      setIsAddDialogOpen(false);
      toast.success("Payment method created successfully");
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to create payment method";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingMethod || !editName.trim()) {
      toast.error("Please enter a payment method name");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updatePaymentMethod(editingMethod.payment_method_id, {
        name: editName.trim(),
      });
      setPaymentMethods((prev) =>
        prev.map((m) =>
          m.payment_method_id === updated.payment_method_id ? updated : m
        )
      );
      setIsEditDialogOpen(false);
      setEditingMethod(null);
      toast.success("Payment method updated successfully");
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to update payment method";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (method: PaymentMethod) => {
    try {
      const updated = await togglePaymentMethodStatus(method.payment_method_id);
      setPaymentMethods((prev) =>
        prev.map((m) =>
          m.payment_method_id === updated.payment_method_id ? updated : m
        )
      );
      toast.success(
        `Payment method ${updated.is_active ? "activated" : "deactivated"}`
      );
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to update status";
      toast.error(message);
    }
  };

  const handleDelete = async (method: PaymentMethod) => {
    if (!confirm(`Are you sure you want to delete "${method.name}"?`)) {
      return;
    }

    try {
      await deletePaymentMethod(method.payment_method_id);
      setPaymentMethods((prev) =>
        prev.filter((m) => m.payment_method_id !== method.payment_method_id)
      );
      toast.success("Payment method deleted successfully");
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to delete payment method";
      toast.error(message);
    }
  };

  const openEditDialog = (method: PaymentMethod) => {
    setEditingMethod(method);
    setEditName(method.name);
    setIsEditDialogOpen(true);
  };

  const systemMethods = paymentMethods.filter((m) => m.is_system_default);
  const customMethods = paymentMethods.filter((m) => !m.is_system_default);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-gray-600">
            Manage payment methods for your orders
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Payment Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Payment Method Name</Label>
                <Input
                  id="name"
                  value={newMethodName}
                  onChange={(e) => setNewMethodName(e.target.value)}
                  placeholder="e.g., bKash, Nagad, PayPal"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* System Default Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="w-4 h-4" />
            Default Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            These are system default payment methods available to all users. They cannot be modified or deleted.
          </p>
          <div className="grid gap-3">
            {systemMethods.map((method) => (
              <div
                key={method.payment_method_id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{method.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    System Default
                  </Badge>
                </div>
                <Badge
                  className={
                    method.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {method.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="w-4 h-4" />
            Custom Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customMethods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No custom payment methods yet</p>
              <p className="text-sm">
                Click &quot;Add Payment Method&quot; to create one
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {customMethods.map((method) => (
                <div
                  key={method.payment_method_id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span className="font-medium">{method.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {method.is_active ? "Active" : "Inactive"}
                      </span>
                      <Switch
                        checked={method.is_active}
                        onCheckedChange={() => handleToggleStatus(method)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(method)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(method)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="edit-name">Payment Method Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Payment method name"
                onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
