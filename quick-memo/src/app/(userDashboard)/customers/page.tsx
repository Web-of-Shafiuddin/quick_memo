'use client'
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { customerService, Customer } from "@/services/customerService";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

const CustomersPage = () => {
  const { format: formatPrice } = useCurrency();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (search?: string) => {
    try {
      setLoading(true);
      const response = await customerService.getAll({ search });
      setCustomers(response.data);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      alert(error.response?.data?.error || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCustomers(searchTerm);
  };

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email || "",
        mobile: customer.mobile || "",
        address: customer.address || "",
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: "", email: "", mobile: "", address: "" });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    setFormData({ name: "", email: "", mobile: "", address: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const submitData = {
        name: formData.name,
        email: formData.email || null,
        mobile: formData.mobile || null,
        address: formData.address || null,
      };

      if (editingCustomer) {
        await customerService.update(editingCustomer.customer_id, submitData);
        alert('Customer updated successfully');
      } else {
        await customerService.create(submitData);
        alert('Customer created successfully');
      }
      handleCloseDialog();
      fetchCustomers();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      alert(error.response?.data?.error || 'Failed to save customer');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete customer "${name}"? This will fail if the customer has existing orders.`
    );
    if (isConfirmed) {
      try {
        await customerService.delete(id);
        alert('Customer deleted successfully');
        fetchCustomers();
      } catch (error: any) {
        console.error('Error deleting customer:', error);
        alert(error.response?.data?.error || 'Failed to delete customer');
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </DialogTitle>
                <DialogDescription>
                  {editingCustomer
                    ? 'Update the customer details.'
                    : 'Create a new customer for your business.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="e.g., +1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g., 123 Main St, City, Country"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search customers by name, email, or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="max-w-sm"
        />
        <Button onClick={handleSearch} variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        {searchTerm && (
          <Button
            onClick={() => {
              setSearchTerm("");
              fetchCustomers();
            }}
            variant="ghost"
          >
            Clear
          </Button>
        )}
      </div>

      <Table>
        <TableCaption>A list of all your customers with their order statistics.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No customers found. Create your first customer to get started.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.customer_id}>
                <TableCell className="font-medium">{customer.customer_id}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email || '-'}</TableCell>
                <TableCell>{customer.mobile || '-'}</TableCell>
                <TableCell className="max-w-xs truncate">{customer.address || '-'}</TableCell>
                <TableCell>{customer.order_count || 0}</TableCell>
                <TableCell>{formatPrice(parseFloat(customer.total_spent?.toString() || '0'))}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(customer)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(customer.customer_id, customer.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomersPage;
