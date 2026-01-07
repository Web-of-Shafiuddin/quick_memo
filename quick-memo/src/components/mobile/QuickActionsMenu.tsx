"use client";

import { useState } from "react";
import {
  FileText,
  Tag,
  CreditCard,
  Crown,
  Palette,
  Save,
  Calendar,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickActionItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

const quickActions = [
  { href: "/categories", label: "Categories", icon: FileText },
  { href: "/attributes", label: "Attributes", icon: Tag },
  { href: "/products", label: "Products", icon: FileText },
  { href: "/customers", label: "Customers", icon: FileText },
  { href: "/orders", label: "Orders", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: FileText },
] satisfies QuickActionItem[];

const settingsActions = [
  { href: "/dashboard/profile", label: "Profile Settings", icon: FileText },
  { href: "/subscription", label: "Subscription", icon: Crown },
  { href: "/payment-methods", label: "Payment Methods", icon: CreditCard },
] satisfies QuickActionItem[];

// const comingSoonActions = [
//   { label: "Themes & Colors", icon: Palette },
//   { label: "Memo Presets", icon: Save },
//   { label: "Order History", icon: Calendar },
// ] satisfies QuickActionItem[];

export function QuickActionsMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const ActionItem = ({ href, label, icon: Icon, disabled }: QuickActionItem) => {
    const buttonContent = (
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled}
      >
        <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="truncate">{label}</span>
      </Button>
    );

    return href ? (
      <Link href={href} className="w-full">
        {buttonContent}
      </Link>
    ) : (
      <div className="w-full">{buttonContent}</div>
    );
  };

  // const ComingSoonItem = ({ label, icon: Icon }: QuickActionItem) => (
  //   <Button
  //     variant="outline"
  //     className="w-full justify-start opacity-50 cursor-not-allowed"
  //     disabled
  //   >
  //     <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
  //     <span className="truncate">{label}</span>
  //   </Button>
  // );

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <ActionItem key={index} {...action} />
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground px-1">
              Settings
            </h4>
            {settingsActions.map((action, index) => (
              <ActionItem key={index} {...action} />
            ))}
          </div>

          {/* <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground px-1">
              Coming Soon
            </h4>
            {comingSoonActions.map((action, index) => (
              <ComingSoonItem key={index} {...action} />
            ))}
          </div> */}
        </CardContent>
      )}
    </Card>
  );
}
