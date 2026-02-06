import React from "react";
import { ChevronRight } from "lucide-react";
import { Category } from "@/services/categoryService";
import { getCategoryPath } from "@/lib/categoryUtils";
import { cn } from "@/lib/utils";

interface CategoryBreadcrumbProps {
  category: Category;
  categories: Category[];
  separator?: React.ReactNode;
  className?: string;
}

export function CategoryBreadcrumb({
  category,
  categories,
  separator,
  className,
}: CategoryBreadcrumbProps) {
  // Safety check: return null if category is undefined
  if (!category) {
    return null;
  }

  const path = getCategoryPath(category.category_id, categories);

  if (path.length === 0) {
    return null;
  }

  const defaultSeparator = <ChevronRight className="h-3 w-3 text-muted-foreground" />;

  return (
    <div className={cn("flex items-center gap-1 text-sm", className)}>
      {path.map((cat, index) => (
        <React.Fragment key={cat.category_id}>
          {index > 0 && (
            <span className="flex items-center">{separator || defaultSeparator}</span>
          )}
          <span
            className={cn(
              index === path.length - 1
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            )}
          >
            {cat.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
