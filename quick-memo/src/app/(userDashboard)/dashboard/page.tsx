"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  analyticsService,
  DashboardStats,
  SalesDataPoint,
  TopProduct,
  TopCustomer,
  CategorySales,
  SourceSales,
  OrderStatusDistribution,
  RecentOrder,
  LowStockProduct,
  MonthlyRevenue,
  SalesPrediction,
} from "@/services/analyticsService";
import { formatCurrency } from "@/lib/currency";
import { useCurrency } from "@/hooks/useCurrency";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface PieDataItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#FFBB28',
  PROCESSING: '#0088FE',
  SHIPPED: '#00C49F',
  DELIVERED: '#82ca9d',
  CANCELLED: '#FF8042',
  RETURNED: '#8884d8',
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  const { currency } = useCurrency();

  // Format price helper using BDT as default
  const formatPrice = (amount: number) => formatCurrency(amount, currency);

  // Analytics data states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [salesOverTime, setSalesOverTime] = useState<SalesDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<CategorySales[]>([]);
  const [salesBySource, setSalesBySource] = useState<SourceSales[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusDistribution[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [prediction, setPrediction] = useState<SalesPrediction | null>(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  useEffect(() => {
    fetchSalesOverTime();
  }, [period]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const [
        stats,
        sales,
        products,
        customers,
        categories,
        sources,
        status,
        orders,
        stock,
        monthly,
        pred,
      ] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getSalesOverTime(parseInt(period)),
        analyticsService.getTopProducts(5),
        analyticsService.getTopCustomers(5),
        analyticsService.getSalesByCategory(),
        analyticsService.getSalesBySource(),
        analyticsService.getOrderStatusDistribution(),
        analyticsService.getRecentOrders(5),
        analyticsService.getLowStockProducts(10),
        analyticsService.getMonthlyRevenue(),
        analyticsService.getSalesPrediction(),
      ]);

      setDashboardStats(stats);
      setSalesOverTime(sales);
      setTopProducts(products);
      setTopCustomers(customers);
      setSalesByCategory(categories);
      setSalesBySource(sources);
      setOrderStatus(status);
      setRecentOrders(orders);
      setLowStock(stock);
      setMonthlyRevenue(monthly);
      setPrediction(pred);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesOverTime = async () => {
    try {
      const sales = await analyticsService.getSalesOverTime(parseInt(period));
      setSalesOverTime(sales);
    } catch (error) {
      console.error("Error fetching sales over time:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your business overview.</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(dashboardStats?.totals.revenue || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {(dashboardStats?.growth.revenue || 0) >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+{dashboardStats?.growth.revenue}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{dashboardStats?.growth.revenue}%</span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totals.orders || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {(dashboardStats?.growth.orders || 0) >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+{dashboardStats?.growth.orders}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{dashboardStats?.growth.orders}%</span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totals.customers || 0}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totals.products || 0}</div>
            <p className="text-xs text-muted-foreground">Total products</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Quick View */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{dashboardStats?.totals.pendingOrders || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Delivered</p>
                <p className="text-2xl font-bold text-green-900">{dashboardStats?.totals.deliveredOrders || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">This Month</p>
                <p className="text-2xl font-bold text-blue-900">{formatPrice(dashboardStats?.thisMonth.revenue || 0)}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Last Month</p>
                <p className="text-2xl font-bold text-purple-900">{formatPrice(dashboardStats?.lastMonth.revenue || 0)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="prediction">Prediction</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          {/* Sales Over Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
              <CardDescription>Revenue and order trends for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? formatPrice(value) : value,
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]}
                      labelFormatter={formatDate}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name="Revenue"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                      name="Orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sales by Category and Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={salesByCategory.map(c => ({ name: c.category_name, value: c.total_revenue } as PieDataItem))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {salesByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatPrice(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Source</CardTitle>
                <CardDescription>Orders by acquisition channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesBySource} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="order_source" type="category" width={100} />
                      <Tooltip formatter={(value: number, name: string) => [
                        name === 'total_revenue' ? formatPrice(value) : value,
                        name === 'total_revenue' ? 'Revenue' : 'Orders'
                      ]} />
                      <Bar dataKey="order_count" fill="#8884d8" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Breakdown of orders by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Orders">
                      {orderStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Selling Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performers by quantity sold</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.product_id} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.total_sold} sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(product.total_revenue)}</p>
                        <p className="text-xs text-muted-foreground">{product.order_count} orders</p>
                      </div>
                    </div>
                  ))}
                  {topProducts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No product data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription>Products running low on inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStock.map((product) => (
                    <div key={product.product_id} className="flex items-center gap-4">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                        {product.stock} left
                      </Badge>
                    </div>
                  ))}
                  {lowStock.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">All products well stocked!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Product Revenue Comparison</CardTitle>
              <CardDescription>Revenue generated by top products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatPrice(value)} />
                    <Bar dataKey="total_revenue" fill="#8884d8" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Highest spending customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div key={customer.customer_id} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.mobile || customer.email || 'No contact'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(customer.total_spent)}</p>
                        <p className="text-xs text-muted-foreground">{customer.order_count} orders</p>
                      </div>
                    </div>
                  ))}
                  {topCustomers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No customer data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest order activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.transaction_id} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.order_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        order.order_status === 'DELIVERED' ? 'default' :
                        order.order_status === 'CANCELLED' ? 'destructive' :
                        'secondary'
                      }>
                        {order.order_status}
                      </Badge>
                      <p className="font-medium">{formatPrice(order.total_amount)}</p>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No orders yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Spending Analysis</CardTitle>
              <CardDescription>Top customers by total spend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCustomers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip formatter={(value: number) => formatPrice(value)} />
                    <Bar dataKey="total_spent" fill="#82ca9d" name="Total Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prediction Tab */}
        <TabsContent value="prediction" className="space-y-6">
          {/* Monthly Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>Revenue over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? formatPrice(value) : value,
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]}
                      labelFormatter={formatMonth}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Prediction Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Next Month Prediction
                </CardTitle>
                <CardDescription>Based on 3-month moving average</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Predicted Revenue</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {formatPrice(prediction?.prediction.nextMonth.revenue || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Predicted Orders</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {prediction?.prediction.nextMonth.orders || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Trend Analysis
                </CardTitle>
                <CardDescription>3-month trend indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue Trend</p>
                    <div className="flex items-center gap-2">
                      {Number(prediction?.prediction.trends.revenue || 0) >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <p className={`text-2xl font-bold ${Number(prediction?.prediction.trends.revenue || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {prediction?.prediction.trends.revenue || 0}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Orders Trend</p>
                    <div className="flex items-center gap-2">
                      {Number(prediction?.prediction.trends.orders || 0) >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <p className={`text-2xl font-bold ${Number(prediction?.prediction.trends.orders || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {prediction?.prediction.trends.orders || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Comparison */}
          {prediction && prediction.historical.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historical Performance (Last 3 Months)</CardTitle>
                <CardDescription>Data used for prediction calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {prediction.historical.map((month, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="font-medium text-center mb-2">{formatMonth(month.month)}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-semibold">{formatPrice(month.revenue)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Orders</p>
                            <p className="font-semibold">{month.orders}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
