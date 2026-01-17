"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileMenuItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  sections?: Array<{
    title: string;
    items: MobileMenuItem[];
  }>;
  items?: MobileMenuItem[];
}

export function MobileMenu({
  open,
  onOpenChange,
  title = "Menu",
  sections,
  items,
}: MobileMenuProps) {
  const pathname = usePathname();

  const MenuItem = ({ href, label, icon: Icon }: MobileMenuItem) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => onOpenChange(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent text-accent-foreground"
        }`}
      >
        {Icon && <Icon className="w-5 h-5" />}
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[320px] sm:w-[380px] h-[80vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button> */}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {items?.map((item, index) => (
            <MenuItem key={index} {...item} />
          ))}

          {sections?.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <MenuItem key={itemIndex} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
