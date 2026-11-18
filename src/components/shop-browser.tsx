"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { products, climateLabel, type Climate } from "@/lib/products";
import { rateNote } from "@/lib/money";

const filters = ["all", "humid", "room", "travel"] as const;

export function ShopBrowser() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const visible = products.filter(
    (product) => filter === "all" || product.climates.includes(filter as Climate),
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item}
            type="button"
            variant={filter === item ? "default" : "outline"}
            className="h-10 px-4"
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item === "all" ? "All" : climateLabel[item]}
          </Button>
        ))}
      </div>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">{rateNote}</p>
      {visible.length === 0 ? (
        <div className="mt-12 border border-dashed border-border px-6 py-16 text-center">
          <p className="font-serif text-3xl">Nothing for this air yet.</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Try another filter. The line is short on purpose.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
