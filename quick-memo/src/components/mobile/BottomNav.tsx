"use client";

import { Home, ShoppingCart, Package, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const bottomNavItems: BottomNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  const NavItem = ({ href, label, icon: Icon }: BottomNavItem) => {
    const isActive = pathname === href || pathname.startsWith(href + "/");

    return (
      <Link
        href={href}
        className={cn(
          "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="w-5 h-5" />
        <span className="truncate max-w-[60px]">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-40">
      <div className="flex items-center justify-around h-16">
        {bottomNavItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
}
