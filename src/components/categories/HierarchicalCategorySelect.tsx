"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Folder, FileText, X } from "lucide-react";
import { Category } from "@/services/categoryService";
import { getCategoryPath, getCategoryDepth } from "@/lib/categoryUtils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HierarchicalCategorySelectProps {
  categories: Category[];
  value: number | null;
  onValueChange: (value: number | null) => void;
  placeholder?: string;
  excludeIds?: number[];
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
}

export function HierarchicalCategorySelect({
  categories,
  value,
  onValueChange,
  placeholder = "Select category...",
  excludeIds = [],
  allowClear = false,
  disabled = false,
  className,
}: HierarchicalCategorySelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCategory = categories.find((cat) => cat.category_id === value);

  // Build display label with breadcrumb path
  const getDisplayLabel = (category: Category): string => {
    const path = getCategoryPath(category.category_id, categories);
    return path.map((cat) => cat.name).join(" > ");
  };

  // Get indentation level for visual hierarchy
  const getIndentation = (category: Category): number => {
    return getCategoryDepth(category.category_id, categories);
  };

  // Sort categories to show parents before children
  const sortedCategories = React.useMemo(() => {
    // Build display labels inline to avoid dependency issues
    const buildLabel = (category: Category): string => {
      const path = getCategoryPath(category.category_id, categories);
      return path.map((cat) => cat.name).join(" > ");
    };

    return [...categories].sort((a, b) => {
      const pathA = buildLabel(a);
      const pathB = buildLabel(b);
      return pathA.localeCompare(pathB);
    });
  }, [categories]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate flex-1 text-left">
            {selectedCategory ? (
              <span className="flex items-center gap-2">
                {selectedCategory.children_count && selectedCategory.children_count > 0 ? (
                  <Folder className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
                {getDisplayLabel(selectedCategory)}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <div className="flex items-center gap-1 ml-2">
            {allowClear && selectedCategory && !disabled && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No categories found.</CommandEmpty>
            <CommandGroup>
              {/* Option to clear selection */}
              {allowClear && (
                <CommandItem
                  value="__none__"
                  onSelect={() => {
                    onValueChange(null);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-muted-foreground italic">
                    None (Root Category)
                  </span>
                </CommandItem>
              )}
              {sortedCategories.map((category) => {
                const isExcluded = excludeIds.includes(category.category_id);
                const depth = getIndentation(category);
                const hasChildren = category.children_count && category.children_count > 0;

                return (
                  <CommandItem
                    key={category.category_id}
                    value={getDisplayLabel(category)}
                    onSelect={() => {
                      if (!isExcluded) {
                        onValueChange(category.category_id);
                        setOpen(false);
                      }
                    }}
                    disabled={isExcluded}
                    className={cn(isExcluded && "opacity-50 cursor-not-allowed")}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category.category_id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div
                      className="flex items-center gap-2 flex-1"
                      style={{ paddingLeft: `${depth * 1.5}rem` }}
                    >
                      {hasChildren ? (
                        <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">{category.name}</span>
                        {depth > 0 && (
                          <span className="text-xs text-muted-foreground truncate">
                            {getDisplayLabel(category)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
