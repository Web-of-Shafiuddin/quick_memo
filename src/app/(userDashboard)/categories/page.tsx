'use client';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categoryService, Category, CreateCategoryInput } from "@/services/categoryService";
import { Plus, Pencil, Trash2, LayoutList, Network } from "lucide-react";
import { toast } from "sonner";
import { CategoryTreeView } from "@/components/categories/CategoryTreeView";
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll();
      setCategories(response.data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: Category, parent?: Category) => {
    setEditingCategory(category || null);
    setParentCategory(parent || null);
    setIsDialogOpen(true);
  };

  const handleAddChild = (parent: Category) => {
    setParentCategory(parent);
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: CreateCategoryInput) => {
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.category_id, data);
        toast.success('Category updated successfully');
      } else {
        await categoryService.create(data);
        toast.success('Category created successfully');
      }
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.error || 'Failed to save category');
      throw error; // Re-throw to let dialog handle it
    }
  };

  const handleDelete = async (category: Category) => {
    const childrenCount = category.children_count || 0;

    if (childrenCount > 0) {
      toast.error(
        `Cannot delete category with ${childrenCount} child categor${
          childrenCount > 1 ? 'ies' : 'y'
        }. Please delete or reassign children first.`
      );
      return;
    }

    const message = `Are you sure you want to delete "${category.name}"? This will affect all products in this category.`;
    const isConfirmed = window.confirm(message);

    if (isConfirmed) {
      try {
        await categoryService.delete(category.category_id);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error: any) {
        console.error('Error deleting category:', error);
        toast.error(error.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage product categories with hierarchical structure</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'tree' | 'table')}>
        <TabsList className="mb-4">
          <TabsTrigger value="tree" className="gap-2">
            <Network className="h-4 w-4" />
            Tree View
          </TabsTrigger>
          <TabsTrigger value="table" className="gap-2">
            <LayoutList className="h-4 w-4" />
            Table View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="mt-0">
          <CategoryTreeView
            categories={categories}
            onEdit={(category) => handleOpenDialog(category)}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <Table>
            <TableCaption>A list of all your product categories.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Children</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No categories found. Create your first category to get started.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.category_id}>
                    <TableCell className="font-medium">{category.category_id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      {category.parent_category_name || (
                        <span className="text-muted-foreground italic">Root</span>
                      )}
                    </TableCell>
                    <TableCell>{category.product_count || 0}</TableCell>
                    <TableCell>{category.children_count || 0}</TableCell>
                    <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddChild(category)}
                          title="Add child category"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(category)}
                          title="Edit category"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(category)}
                          title="Delete category"
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
        </TabsContent>
      </Tabs>

      <CategoryFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={editingCategory}
        parentCategory={parentCategory}
        categories={categories}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CategoriesPage;
