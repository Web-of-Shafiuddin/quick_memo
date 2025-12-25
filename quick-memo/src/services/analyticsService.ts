import api from '@/lib/api';

export interface DashboardStats {
  totals: {
    orders: number;
    revenue: number;
    customers: number;
    products: number;
    pendingOrders: number;
    deliveredOrders: number;
  };
  thisMonth: {
    orders: number;
    revenue: number;
  };
  lastMonth: {
    orders: number;
    revenue: number;
  };
  growth: {
    revenue: number;
    orders: number;
  };
}

export interface SalesDataPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface TopProduct {
  product_id: number;
  name: string;
  sku: string;
  image: string | null;
  total_sold: number;
  total_revenue: number;
  order_count: number;
}

export interface TopCustomer {
  customer_id: number;
  name: string;
  email: string | null;
  mobile: string | null;
  order_count: number;
  total_spent: number;
  last_order_date: string | null;
}

export interface CategorySales {
  category_id: number;
  category_name: string;
  items_sold: number;
  total_revenue: number;
}

export interface SourceSales {
  order_source: string;
  order_count: number;
  total_revenue: number;
}

export interface OrderStatusDistribution {
  status: string;
  count: number;
}

export interface RecentOrder {
  transaction_id: string;
  order_date: string;
  order_status: string;
  total_amount: number;
  customer_name: string;
}

export interface LowStockProduct {
  product_id: number;
  name: string;
  sku: string;
  stock: number;
  image: string | null;
}

export interface MonthlyRevenue {
  month: string;
  orders: number;
  revenue: number;
}

export interface SalesPrediction {
  historical: MonthlyRevenue[];
  prediction: {
    nextMonth: {
      revenue: number;
      orders: number;
    };
    trends: {
      revenue: number;
      orders: number;
    };
  };
}

export const analyticsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/analytics/dashboard');
    return response.data.data;
  },

  getSalesOverTime: async (period: number = 30): Promise<SalesDataPoint[]> => {
    const response = await api.get(`/analytics/sales/over-time?period=${period}`);
    return response.data.data;
  },

  getTopProducts: async (limit: number = 10): Promise<TopProduct[]> => {
    const response = await api.get(`/analytics/products/top?limit=${limit}`);
    return response.data.data;
  },

  getTopCustomers: async (limit: number = 10): Promise<TopCustomer[]> => {
    const response = await api.get(`/analytics/customers/top?limit=${limit}`);
    return response.data.data;
  },

  getSalesByCategory: async (): Promise<CategorySales[]> => {
    const response = await api.get('/analytics/sales/by-category');
    return response.data.data;
  },

  getSalesBySource: async (): Promise<SourceSales[]> => {
    const response = await api.get('/analytics/sales/by-source');
    return response.data.data;
  },

  getOrderStatusDistribution: async (): Promise<OrderStatusDistribution[]> => {
    const response = await api.get('/analytics/orders/status-distribution');
    return response.data.data;
  },

  getRecentOrders: async (limit: number = 5): Promise<RecentOrder[]> => {
    const response = await api.get(`/analytics/orders/recent?limit=${limit}`);
    return response.data.data;
  },

  getLowStockProducts: async (threshold: number = 10): Promise<LowStockProduct[]> => {
    const response = await api.get(`/analytics/products/low-stock?threshold=${threshold}`);
    return response.data.data;
  },

  getMonthlyRevenue: async (): Promise<MonthlyRevenue[]> => {
    const response = await api.get('/analytics/sales/monthly');
    return response.data.data;
  },

  getSalesPrediction: async (): Promise<SalesPrediction> => {
    const response = await api.get('/analytics/sales/prediction');
    return response.data.data;
  },
};
