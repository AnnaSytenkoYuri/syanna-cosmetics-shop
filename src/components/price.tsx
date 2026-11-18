"use client";

import { formatMoney, type Currency } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useShop } from "@/components/shop-provider";

export function Price({
  usd,
  compareAtUsd,
  className,
  currency,
  slug,
}: {
  usd: number;
  compareAtUsd?: number;
  className?: string;
  currency?: Currency;
  slug?: string;
}) {
  const shop = useShop();
  const active = currency ?? shop.currency;
  const amount = slug ? shop.priceFor(slug, usd) : usd;
  const compare = compareAtUsd && compareAtUsd > amount ? compareAtUsd : undefined;

  return (
    <p className={cn("text-sm tabular-nums", className)}>
      {compare ? (
        <span className="mr-2 line-through opacity-60">
          {formatMoney(compare, active)}
        </span>
      ) : null}
      <span className="font-medium">{formatMoney(amount, active)}</span>
    </p>
  );
}
