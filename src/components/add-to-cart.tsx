"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/components/shop-provider";
import { cn } from "@/lib/utils";

export function AddToCart({
  slug,
  withQty = false,
  className,
  buttonClassName,
  label = "Add to bag",
}: {
  slug: string;
  withQty?: boolean;
  className?: string;
  buttonClassName?: string;
  label?: string;
}) {
  const { add, stockFor } = useShop();
  const stock = stockFor(slug);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = stock <= 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {withQty ? (
        <div className="flex h-12 items-center border border-border">
          <button
            type="button"
            className="h-full px-3 text-lg"
            onClick={() => setQty((value) => Math.max(1, value - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-6 text-center text-sm tabular-nums">{qty}</span>
          <button
            type="button"
            className="h-full px-3 text-lg"
            onClick={() => setQty((value) => Math.min(6, stock, value + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      ) : null}
      <Button
        type="button"
        className={cn("h-12 px-5", buttonClassName)}
        disabled={soldOut}
        onClick={() => {
          add(slug, withQty ? qty : 1);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1400);
        }}
      >
        {soldOut ? "Sold out" : added ? "Added" : label}
      </Button>
    </div>
  );
}

