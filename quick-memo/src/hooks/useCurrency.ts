import { useMemo } from "react";
import useAuthStore from "@/store/authStore";
import { useShallow } from "zustand/react/shallow";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

export function useCurrency() {
  const { user } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
    }))
  );

  const currency = user?.preferred_currency || "USD";
  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const format = useMemo(
    () => (amount: number) => formatCurrency(amount, currency),
    [currency]
  );

  return {
    currency,
    symbol,
    format,
  };
}
