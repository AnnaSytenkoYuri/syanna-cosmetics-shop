"use client";

import Link from "next/link";
import { Price } from "@/components/price";
import { ProductMark } from "@/components/product-mark";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useShop } from "@/components/shop-provider";
import { rateNote } from "@/lib/money";

export function CartView() {
  const { hydrated, items, totalUsd, setQty, remove } = useShop();

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-28 animate-pulse bg-muted" />
        <div className="h-28 animate-pulse bg-muted" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-border px-6 py-16">
        <p className="font-serif text-4xl">The bag is empty.</p>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          The line is four products and one set. Start with the set if you want
          the whole idea, or with Water Veil if you want the single piece the
          brand hangs on.
        </p>
        <Button className="mt-8 h-12 px-5" nativeButton={false}
          render={<Link href="/shop" />}>
          Browse the shop
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
      <ul className="divide-y divide-border border-y border-border">
        {items.map(({ product, qty }) => (
          <li key={product.slug} className="flex gap-4 py-5">
            <Link href={`/product/${product.slug}`} className="shrink-0">
              <ProductMark product={product} compact className="h-28 w-24" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="font-serif text-2xl leading-none hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground">{product.size}</p>
                </div>
                <Price usd={product.priceUsd * qty} />
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-10 items-center border border-border">
                  <button
                    type="button"
                    className="h-full px-3"
                    aria-label={`Decrease ${product.name}`}
                    onClick={() => setQty(product.slug, qty - 1)}
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm tabular-nums">{qty}</span>
                  <button
                    type="button"
                    className="h-full px-3"
                    aria-label={`Increase ${product.name}`}
                    onClick={() => setQty(product.slug, qty + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  onClick={() => remove(product.slug)}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit border border-border p-6">
        <h2 className="font-serif text-2xl">Summary</h2>
        <Separator className="my-4" />
        <div className="flex items-center justify-between text-sm">
          <span>Subtotal</span>
          <Price usd={totalUsd} />
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Shipping is not calculated. This preview does not charge a card or
          reserve stock.
        </p>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{rateNote}</p>
        <Button className="mt-6 h-12 w-full" nativeButton={false}
          render={<Link href="/checkout" />}>
          Continue to checkout
        </Button>
      </aside>
    </div>
  );
}
