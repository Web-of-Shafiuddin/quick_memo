"use client";

import React, { useState, useEffect } from "react";
import { Category, CreateCategoryInput } from "@/services/categoryService";
import { getDescendantIds } from "@/lib/categoryUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HierarchicalCategorySelect } from "./HierarchicalCategorySelect";
import { CategoryBreadcrumb } from "./CategoryBreadcrumb";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  parentCategory?: Category | null;
  categories: Category[];
  onSubmit: (data: CreateCategoryInput) => Promise<void>;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  parentCategory,
  categories,
  onSubmit,
}: CategoryFormDialogProps) {
  const [name, setName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when dialog opens or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        // Editing existing category
        setName(category.name);
        setSelectedParentId(category.parent_category_id || null);
      } else if (parentCategory) {
        // Creating child category
        setName("");
        setSelectedParentId(parentCategory.category_id);
      } else {
        // Creating root category
        setName("");
        setSelectedParentId(null);
      }
    }
  }, [open, category, parentCategory]);

  // Calculate excluded IDs to prevent circular references
  const excludedIds = React.useMemo(() => {
    if (!category) return [];

    // Exclude self and all descendants
    const descendants = getDescendantIds(category.category_id, categories);
    return [category.category_id, ...descendants];
  }, [category, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        parent_category_id: selectedParentId,
      });

      // Reset form
      setName("");
      setSelectedParentId(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedParent = selectedParentId
    ? categories.find((c) => c.category_id === selectedParentId)
    : null;

  const isCreatingChild = !!parentCategory && !category;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {category
                ? "Edit Category"
                : isCreatingChild
                ? "Create Child Category"
                : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              {category
                ? "Update the category name and parent category."
                : isCreatingChild
                ? `Creating a child category under "${parentCategory?.name}".`
                : "Create a new category. Leave parent blank for a root category."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                required
                autoFocus
              />
            </div>

            {/* Parent Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="parent">
                Parent Category
                {isCreatingChild && " (Pre-selected)"}
              </Label>
              <HierarchicalCategorySelect
                categories={categories}
                value={selectedParentId}
                onValueChange={setSelectedParentId}
                placeholder="None (Root Category)"
                excludeIds={excludedIds}
                allowClear
                disabled={isCreatingChild}
              />
              {selectedParent && (
                <div className="mt-2">
                  <CategoryBreadcrumb
                    category={selectedParent}
                    categories={categories}
                    className="text-xs text-muted-foreground"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {isCreatingChild
                  ? "Creating as a child of the selected parent."
                  : "Select a parent category or leave blank for a root category."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting
                ? "Saving..."
                : category
                ? "Update Category"
                : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
