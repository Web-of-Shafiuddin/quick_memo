import api from './api';

export interface MarketplaceSettings {
  setting_id: number;
  user_id: number;
  is_opted_in: boolean;
  shop_visibility: 'VISIBLE' | 'HIDDEN';
  featured_priority: number;
  product_opt_in_mode: 'ALL' | 'SELECTIVE' | 'NONE';
  auto_accept_marketplace_orders: boolean;
  marketplace_fulfillment_days: number;
  created_at: string;
  updated_at: string;
}

export interface EarningsDashboard {
  balance: {
    available: number;
    pending: number;
    total_earned: number;
    total_paid_out: number;
    last_payout_at: string | null;
  };
  statistics: {
    total_orders: number;
    total_gross_sales: number;
    total_commission: number;
    total_net_earnings: number;
    average_commission_rate: number;
  };
  recent_commissions: any[];
}

export interface Commission {
  commission_id: number;
  transaction_id: number;
  user_id: number;
  order_source: string;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  commission_status: string;
  payout_status: string;
  created_at: string;
}

export interface Payout {
  payout_id: number;
  user_id: number;
  payout_period_start: string;
  payout_period_end: string;
  total_orders: number;
  total_gross_sales: number;
  total_commission: number;
  total_net_payout: number;
  payout_method: string;
  payout_reference: string;
  payout_status: string;
  created_at: string;
}

class SellerService {
  /**
   * Get marketplace settings
   */
  async getMarketplaceSettings(): Promise<MarketplaceSettings> {
    const response = await api.get('/seller/marketplace/settings');
    return response.data.data;
  }

  /**
   * Update marketplace settings
   */
  async updateMarketplaceSettings(settings: Partial<MarketplaceSettings>): Promise<MarketplaceSettings> {
    const response = await api.put('/seller/marketplace/settings', settings);
    return response.data.data;
  }

  /**
   * Toggle product visibility in marketplace
   */
  async toggleProductVisibility(
    productId: number,
    isVisible: boolean,
    marketplacePrice?: number,
    marketplaceStock?: number
  ) {
    const response = await api.put(`/seller/marketplace/products/${productId}/visibility`, {
      is_visible_in_marketplace: isVisible,
      marketplace_price: marketplacePrice,
      marketplace_stock: marketplaceStock,
    });
    return response.data.data;
  }

  /**
   * Get earnings dashboard
   */
  async getEarningsDashboard(): Promise<EarningsDashboard> {
    const response = await api.get('/seller/earnings/dashboard');
    return response.data.data;
  }

  /**
   * Get commission report
   */
  async getCommissionReport(filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/seller/earnings/commissions?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Get payout history
   */
  async getPayoutHistory(page = 1, limit = 20) {
    const response = await api.get(`/seller/earnings/payouts?page=${page}&limit=${limit}`);
    return response.data.data;
  }

  /**
   * Request payout
   */
  async requestPayout(amount: number, payoutMethod: string, notes?: string) {
    const response = await api.post('/seller/earnings/payout-request', {
      amount,
      payout_method: payoutMethod,
      notes,
    });
    return response.data;
  }
}

export const sellerService = new SellerService();
