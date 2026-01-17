"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/react/shallow";
import {
  CreditCard,
  Crown,
  FileText,
  Home,
  LogOut,
  Menu,
  Package,
  PanelLeft,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";
import { Activity, useEffect, useState } from "react";
import api from "@/lib/api";
import NotificationBell from "@/components/NotificationBell";
import { MobileMenu } from "@/components/mobile/MobileMenu";
import { BottomNav } from "@/components/mobile/BottomNav";
import { QuickActionsMenu } from "@/components/mobile/QuickActionsMenu";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    if (isLoading === false && !user) {
      router.push("/auth/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await api.get("/subscriptions/my-subscription");
        setSubscription(response.data.data || null);
      } catch (error) {
        console.error("Error fetching subscription:", error);
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
      {/* Mobile Menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title="Menu"
        sections={[
          {
            title: "Quick Actions",
            items: [
              { href: "/categories", label: "Categories", icon: FileText },
              { href: "/attributes", label: "Attributes", icon: () => <div className="w-4 h-4" /> },
              { href: "/products", label: "Products", icon: Package },
              { href: "/customers", label: "Customers", icon: Users },
              { href: "/orders", label: "Orders", icon: ShoppingCart },
              { href: "/invoices", label: "Invoices", icon: FileText },
            ],
          },
          {
            title: "Settings",
            items: [
              { href: "/dashboard/profile", label: "Profile Settings", icon: () => <div className="w-4 h-4" /> },
              { href: "/subscription", label: "Subscription", icon: Crown },
              { href: "/payment-methods", label: "Payment Methods", icon: CreditCard },
            ],
          },
        ]}
        items={[
          { href: "/", label: "Home", icon: Home },
        ]}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Welcome back, {user.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {subscription &&
                subscription.status === "ACTIVE" &&
                subscription.plan_name !== "Free" && (
                  <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
                    <Crown className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">{subscription.plan_name}</span>
                    <span className="sm:hidden">Pro</span>
                  </Badge>
                )}
              {subscription && subscription.status === "GRACE_PERIOD" && (
                <Link href="/subscription">
                  <Badge className="bg-orange-100 text-orange-800 cursor-pointer hover:bg-orange-200 text-xs">
                    Grace Period
                  </Badge>
                </Link>
              )}
              {subscription && subscription.status === "EXPIRED" && (
                <Link href="/subscription">
                  <Badge className="bg-red-100 text-red-800 cursor-pointer hover:bg-red-200 text-xs">
                    Expired
                  </Badge>
                </Link>
              )}
              {subscription &&
                subscription.status === "ACTIVE" &&
                subscription.plan_name === "Free" && (
                  <Badge className="bg-gray-100 text-gray-800 text-xs">Free</Badge>
                )}
              {!subscription && (
                <Link href="/subscription">
                  <Badge className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Subscribe
                  </Badge>
                </Link>
              )}
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex"
                title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
              >
                <PanelLeft className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} />
              </Button>
              <div className="hidden md:flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions - Hidden on mobile, conditionally visible on desktop */}
          <Activity mode={sidebarOpen ? "visible" : "hidden"}>
            <QuickActionsMenu />
          </Activity>
          {/* Main Content - Full width on mobile, variable on desktop */}
          <div className={`${sidebarOpen ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  );
}
