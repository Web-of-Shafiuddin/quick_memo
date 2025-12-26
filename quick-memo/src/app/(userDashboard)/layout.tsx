"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Crown,
  FileText,
  Home,
  LogOut,
  Palette,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import NotificationBell from "@/components/NotificationBell";

interface Subscription {
  subscription_id: number;
  plan_id: number;
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
}

export default function ProtectedUserDashboardlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      isLoading: state.isLoading,
    }))
  );
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if(isLoading === false && !user) {
      router.push("/auth/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await api.get('/subscriptions/my-subscription');
        setSubscription(response.data.data || null);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    useAuthStore.getState().clearUser();
    router.push("/auth/login");
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {subscription && subscription.status === 'ACTIVE' && subscription.plan_name !== 'Free' && (
                <Badge className="bg-green-100 text-green-800">
                  <Crown className="w-3 h-3 mr-1" />
                  {subscription.plan_name} Active
                </Badge>
              )}
              {subscription && subscription.status === 'GRACE_PERIOD' && (
                <Link href="/subscription">
                  <Badge className="bg-orange-100 text-orange-800 cursor-pointer hover:bg-orange-200">
                    Grace Period - Renew Now
                  </Badge>
                </Link>
              )}
              {subscription && subscription.status === 'EXPIRED' && (
                <Link href="/subscription">
                  <Badge className="bg-red-100 text-red-800 cursor-pointer hover:bg-red-200">
                    Expired - Renew Now
                  </Badge>
                </Link>
              )}
              {subscription && subscription.status === 'ACTIVE' && subscription.plan_name === 'Free' && (
                <Badge className="bg-gray-100 text-gray-800">Free Plan</Badge>
              )}
              {!subscription && (
                <Link href="/subscription">
                  <Badge className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200">
                    <Crown className="w-3 h-3 mr-1" />
                    Subscribe
                  </Badge>
                </Link>
              )}
              <NotificationBell />
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/categories">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Categories
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Products
                  </Button>
                </Link>
                <Link href="/customers">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Customers
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Orders
                  </Button>
                </Link>
                <Link href="/invoices">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Invoices
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Button>
                </Link>
                <Link href="/subscription">
                  <Button variant="outline" className="w-full justify-start">
                    <Crown className="w-4 h-4 mr-2" />
                    Subscription
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Themes & Colors
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Save className="w-4 h-4 mr-2" />
                  Memo Presets
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Order History
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">{children}</div>
        </div>
      </main>
    </div>
  );
}
