import api from "@/lib/api";

export interface MarketplaceProduct {
  product_id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  shop_name: string;
  shop_slug: string;
  is_verified: boolean;
  has_badge: boolean;
  category_name: string;
  variant_count: number;
  average_rating: number;
  review_count: number;
  marketplace_fulfillment_days: number;
  featured_priority: number;
}

export interface MarketplaceShop {
  user_id: number;
  shop_name: string;
  shop_slug: string;
  is_verified: boolean;
  has_badge: boolean;
  product_count: number;
  average_rating: number;
  review_count: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'rating' | 'popular';
  page?: number;
  limit?: number;
}

class MarketplaceService {
  /**
   * Get marketplace products with filters
   */
  async getProducts(filters: ProductFilters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/marketplace/products?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Get single product details
   */
  async getProduct(sku: string) {
    const response = await api.get(`/marketplace/products/${sku}`);
    return response.data.data;
  }

  /**
   * Get participating shops
   */
  async getShops(page = 1, limit = 20) {
    const response = await api.get(`/marketplace/shops?page=${page}&limit=${limit}`);
    return response.data.data;
  }

  /**
   * Get marketplace categories
   */
  async getCategories() {
    const response = await api.get('/marketplace/categories');
    return response.data.data;
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 10) {
    const response = await api.get(`/marketplace/featured?limit=${limit}`);
    return response.data.data;
  }
}

export const marketplaceService = new MarketplaceService();
