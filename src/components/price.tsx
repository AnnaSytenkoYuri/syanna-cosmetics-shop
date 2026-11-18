"use client";

import { formatMoney, type Currency } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useShop } from "@/components/shop-provider";

export function Price({
  usd,
  compareAtUsd,
  className,
  currency,
}: {
  usd: number;
  compareAtUsd?: number;
  className?: string;
  currency?: Currency;
}) {
  const shop = useShop();
  const active = currency ?? shop.currency;

  return (
    <p className={cn("text-sm tabular-nums", className)}>
      {compareAtUsd ? (
        <span className="mr-2 line-through opacity-60">
          {formatMoney(compareAtUsd, active)}
        </span>
      ) : null}
      <span className="font-medium">{formatMoney(usd, active)}</span>
    </p>
  );
}
