import currencyCodes from "currency-codes";
import countryToCurrency from "country-to-currency";

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

// Get currency code from country code (ISO 3166-1 alpha-2)
export function getCurrencyFromCountry(countryCode: string): string {
  const currency =
    countryToCurrency[countryCode.toUpperCase() as keyof typeof countryToCurrency];
  return currency || "USD";
}

// Get full currency information
export function getCurrencyInfo(currencyCode: string): CurrencyInfo | null {
  const info = currencyCodes.code(currencyCode);
  if (!info) return null;

  return {
    code: info.code,
    name: info.currency,
    symbol: getCurrencySymbol(info.code),
    decimals: info.digits,
  };
}

// Get all available currencies
export function getAllCurrencies(): CurrencyInfo[] {
  return currencyCodes.data
    .filter((c) => c.code && c.currency)
    .map((c) => ({
      code: c.code,
      name: c.currency,
      symbol: getCurrencySymbol(c.code),
      decimals: c.digits,
    }));
}

// Common currency symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  BDT: "৳",
  INR: "₹",
  PKR: "₨",
  AED: "د.إ",
  SAR: "﷼",
  KRW: "₩",
  THB: "฿",
  VND: "₫",
  PHP: "₱",
  MYR: "RM",
  SGD: "S$",
  IDR: "Rp",
  TRY: "₺",
  RUB: "₽",
  PLN: "zł",
  BRL: "R$",
  ZAR: "R",
  NGN: "₦",
  ILS: "₪",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  HKD: "HK$",
  TWD: "NT$",
  CAD: "C$",
  AUD: "A$",
  NZD: "NZ$",
};

// Get currency symbol
export function getCurrencySymbol(currencyCode: string): string {
  if (CURRENCY_SYMBOLS[currencyCode]) {
    return CURRENCY_SYMBOLS[currencyCode];
  }

  // Try to get symbol from Intl
  try {
    const formatted = new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    }).format(0);
    return formatted.replace(/[\d.,\s]/g, "").trim() || currencyCode;
  } catch {
    return currencyCode;
  }
}

// Format currency amount
export function formatCurrency(
  amount: number,
  currencyCode: string = "USD"
): string {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString()}`;
  }
}
