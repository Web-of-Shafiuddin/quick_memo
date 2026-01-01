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
}
