"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getAllCurrencies, getCurrencySymbol } from "@/lib/currency";
import { Search } from "lucide-react";

interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CurrencySelector({
  value,
  onChange,
  disabled,
}: CurrencySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const currencies = useMemo(() => getAllCurrencies(), []);

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return currencies;
    const query = searchQuery.toLowerCase();
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query)
    );
  }, [currencies, searchQuery]);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select currency">
          {value && (
            <span>
              {getCurrencySymbol(value)} {value}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search currencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredCurrencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <span className="flex items-center gap-2">
                <span className="w-6 text-center font-medium">
                  {currency.symbol}
                </span>
                <span>{currency.code}</span>
                <span className="text-muted-foreground text-sm">
                  - {currency.name}
                </span>
              </span>
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}
