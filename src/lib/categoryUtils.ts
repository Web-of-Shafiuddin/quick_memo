import { Category } from "@/services/categoryService";

/**
 * Convert flat array of categories to nested tree structure
 * @param categories - Flat array of categories
 * @returns Nested tree structure with children property
 */
export function buildCategoryTree(categories: Category[]): Category[] {
  // Create a map for quick lookup
  const categoryMap = new Map<number, Category & { children: Category[] }>();

  // Initialize all categories with empty children array
  categories.forEach((category) => {
    categoryMap.set(category.category_id, { ...category, children: [] });
  });

  const rootCategories: Category[] = [];

  // Build tree structure
  categories.forEach((category) => {
    const categoryWithChildren = categoryMap.get(category.category_id)!;

    if (category.parent_category_id === null || category.parent_category_id === undefined) {
      // Root category
      rootCategories.push(categoryWithChildren);
    } else {
      // Child category - add to parent's children array
      const parent = categoryMap.get(category.parent_category_id);
      if (parent) {
        parent.children.push(categoryWithChildren);
      } else {
        // Orphaned category (parent doesn't exist) - treat as root
        console.warn(
          `Category "${category.name}" (ID: ${category.category_id}) has non-existent parent (ID: ${category.parent_category_id})`
        );
        rootCategories.push(categoryWithChildren);
      }
    }
  });

  return rootCategories;
}

/**
 * Get breadcrumb path from root to specified category
 * @param categoryId - ID of the category
 * @param categories - Flat array of all categories
 * @returns Array of categories from root to specified category
 */
export function getCategoryPath(
  categoryId: number,
  categories: Category[]
): Category[] {
  const categoryMap = new Map<number, Category>();
  categories.forEach((cat) => categoryMap.set(cat.category_id, cat));

  const path: Category[] = [];
  let currentId: number | null | undefined = categoryId;

  // Walk up the parent chain
  while (currentId !== null && currentId !== undefined) {
    const category = categoryMap.get(currentId);
    if (!category) {
      break; // Orphaned category
    }
    path.unshift(category); // Add to beginning of array
    currentId = category.parent_category_id;
  }

  return path;
}

/**
 * Get all descendant IDs for a category (children, grandchildren, etc.)
 * Used to prevent circular references
 * @param categoryId - ID of the parent category
 * @param categories - Flat array of all categories
 * @returns Array of all descendant category IDs
 */
export function getDescendantIds(
  categoryId: number,
  categories: Category[]
): number[] {
  const descendants: number[] = [];

  // Find direct children
  const children = categories.filter(
    (cat) => cat.parent_category_id === categoryId
  );

  children.forEach((child) => {
    descendants.push(child.category_id);
    // Recursively get descendants of this child
    const childDescendants = getDescendantIds(child.category_id, categories);
    descendants.push(...childDescendants);
  });

  return descendants;
}

/**
 * Flatten category tree back to array
 * @param tree - Nested category tree
 * @returns Flat array of categories
 */
export function flattenCategoryTree(tree: Category[]): Category[] {
  const flat: Category[] = [];

  function traverse(categories: Category[]) {
    categories.forEach((category) => {
      flat.push(category);
      if (category.children && category.children.length > 0) {
        traverse(category.children);
      }
    });
  }

  traverse(tree);
  return flat;
}

/**
 * Search categories hierarchically
 * @param categories - Categories to search
 * @param searchTerm - Search term
 * @returns Filtered categories matching search term
 */
export function searchCategories(
  categories: Category[],
  searchTerm: string
): Category[] {
  if (!searchTerm.trim()) {
    return categories;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();

  return categories.filter((category) =>
    category.name.toLowerCase().includes(lowerSearchTerm)
  );
}

/**
 * Sort categories alphabetically while maintaining hierarchy
 * @param categories - Categories to sort
 * @returns Sorted categories
 */
export function sortCategories(categories: Category[]): Category[] {
  const sorted = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // If categories have children, sort them too
  return sorted.map((category) => {
    if (category.children && category.children.length > 0) {
      return {
        ...category,
        children: sortCategories(category.children),
      };
    }
    return category;
  });
}

/**
 * Get depth level of a category in the hierarchy
 * @param categoryId - ID of the category
 * @param categories - Flat array of all categories
 * @returns Depth level (0 for root categories)
 */
export function getCategoryDepth(
  categoryId: number,
  categories: Category[]
): number {
  const path = getCategoryPath(categoryId, categories);
  return path.length - 1; // Subtract 1 because path includes the category itself
}

/**
 * Check if a category has any descendants
 * @param categoryId - ID of the category
 * @param categories - Flat array of all categories
 * @returns True if category has descendants
 */
export function hasDescendants(
  categoryId: number,
  categories: Category[]
): boolean {
  return categories.some((cat) => cat.parent_category_id === categoryId);
}
