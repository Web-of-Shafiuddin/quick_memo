export interface User {
  user_id: number | string;
  email: string;
  name: string;
  mobile: string | null;
  preferred_currency?: string | null;
  shop_name?: string | null;
  shop_owner_name?: string | null;
  shop_mobile?: string | null;
  shop_email?: string | null;
  shop_address?: string | null;
  shop_logo_url?: string | null;
  shop_slug?: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  shop_description?: string | null;
  nid_license_url?: string | null;
  verification_images?: string[];
  social_links?: any;
  preferred_template_id?: number | null;
  is_verified: boolean;
  has_badge?: boolean;
  is_active?: boolean;
}
