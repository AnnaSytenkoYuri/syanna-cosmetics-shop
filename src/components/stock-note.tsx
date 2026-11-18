"use client";

import { useShop } from "@/components/shop-provider";

export function StockNote({ slug }: { slug: string }) {
  const { hydrated, stockFor } = useShop();
  if (!hydrated) return null;
  const stock = stockFor(slug);
  return (
    <p className="mt-3 text-xs text-muted-foreground">
      {stock > 0 ? `${stock} left in this demo.` : "Sold out in this demo."} Nothing is charged.
    </p>
  );
}
