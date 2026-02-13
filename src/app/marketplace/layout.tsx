import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Store, ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdBanner from '@/components/ads/AdBanner';

const inter = Inter({ subsets: ['latin'] });

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      {/* Marketplace Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/marketplace" className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-bold text-lg">ezyMemo Marketplace</h1>
                <p className="text-xs text-muted-foreground">Shop from all stores</p>
              </div>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products across all shops..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link href="/marketplace/cart">
                <Button variant="outline" size="sm" className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="sm">Seller Login</Button>
              </Link>
            </div>
          </div>

          {/* Categories Nav */}
          <nav className="flex items-center gap-6 py-2 text-sm">
            <Link href="/marketplace" className="hover:text-primary">
              All Products
            </Link>
            <Link href="/marketplace?category=Electronics" className="hover:text-primary">
              Electronics
            </Link>
            <Link href="/marketplace?category=Fashion" className="hover:text-primary">
              Fashion
            </Link>
            <Link href="/marketplace?category=Home" className="hover:text-primary">
              Home & Living
            </Link>
            <Link href="/marketplace?sortBy=popular" className="hover:text-primary">
              Popular
            </Link>
            <Link href="/marketplace?sortBy=newest" className="hover:text-primary">
              New Arrivals
            </Link>
          </nav>
        </div>
      </header>

      {/* Top Ad Banner */}
      <AdBanner slot="marketplace_top_banner" variant="banner" />

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">About Marketplace</h3>
              <p className="text-sm text-muted-foreground">
                Discover products from verified sellers across Bangladesh
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Buyers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>How to Buy</li>
                <li>Payment Methods</li>
                <li>Shipping Info</li>
                <li>Return Policy</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Sellers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/settings/marketplace">Start Selling</Link>
                </li>
                <li>Seller Dashboard</li>
                <li>Commission Rates</li>
                <li>Payout Info</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 ezyMemo Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
