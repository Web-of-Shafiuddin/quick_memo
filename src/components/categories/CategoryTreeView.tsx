"use client";

import React from "react";
import { Category } from "@/services/categoryService";
import { buildCategoryTree } from "@/lib/categoryUtils";
import { Folder, FolderOpen, FileText, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface CategoryTreeViewProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddChild: (parentCategory: Category) => void;
  loading?: boolean;
}

export function CategoryTreeView({
  categories,
  onEdit,
  onDelete,
  onAddChild,
  loading,
}: CategoryTreeViewProps) {
  const tree = React.useMemo(() => buildCategoryTree(categories), [categories]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No categories yet</p>
        <p className="text-sm">Create your first category to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tree.map((category) => (
        <CategoryNode
          key={category.category_id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          depth={0}
        />
      ))}
    </div>
  );
}

interface CategoryNodeProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddChild: (parentCategory: Category) => void;
  depth: number;
}

function CategoryNode({
  category,
  onEdit,
  onDelete,
  onAddChild,
  depth,
}: CategoryNodeProps) {
  const hasChildren = category.children && category.children.length > 0;
  const productCount = category.product_count || 0;
  const childrenCount = category.children_count || 0;

  // For leaf nodes (no children)
  if (!hasChildren) {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors",
          depth > 0 && "ml-6"
        )}
        style={{ marginLeft: depth > 0 ? `${depth * 1.5}rem` : undefined }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{category.name}</span>
          {productCount > 0 && (
            <Badge variant="secondary" className="shrink-0">
              {productCount} {productCount === 1 ? "product" : "products"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onAddChild(category)}
            title="Add child category"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(category)}
            title="Edit category"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(category)}
            title="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // For parent nodes (with children) - use Accordion
  return (
    <div
      className={cn(depth > 0 && "ml-6")}
      style={{ marginLeft: depth > 0 ? `${depth * 1.5}rem` : undefined }}
    >
      <Accordion type="single" collapsible className="border-none">
        <AccordionItem value={`category-${category.category_id}`} className="border rounded-md">
          <div className="flex items-center justify-between pr-3">
            <AccordionTrigger className="flex-1 hover:no-underline px-3 py-2 hover:bg-accent/50">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium truncate">{category.name}</span>
                <div className="flex items-center gap-1 ml-2">
                  {productCount > 0 && (
                    <Badge variant="secondary" className="shrink-0">
                      {productCount} {productCount === 1 ? "product" : "products"}
                    </Badge>
                  )}
                  {childrenCount > 0 && (
                    <Badge variant="outline" className="shrink-0">
                      {childrenCount} {childrenCount === 1 ? "child" : "children"}
                    </Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild(category);
                }}
                title="Add child category"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(category);
                }}
                title="Edit category"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(category);
                }}
                title="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <AccordionContent className="pb-0 pt-1">
            <div className="space-y-1">
              {category.children?.map((child) => (
                <CategoryNode
                  key={child.category_id}
                  category={child}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  depth={depth + 1}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
