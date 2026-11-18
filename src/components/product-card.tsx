"use client";

import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { useShop } from "@/components/shop-provider";
import { Price } from "@/components/price";
import { ProductMark } from "@/components/product-mark";
import { Badge } from "@/components/ui/badge";
import { climateLabel, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { priceFor, imageFor, stockFor } = useShop();
  const price = priceFor(product.slug, product.priceUsd);
  const soldOut = stockFor(product.slug) <= 0;
  const compareAt =
    product.compareAtUsd && product.compareAtUsd > price ? product.compareAtUsd : undefined;

  return (
    <article className="flex h-full flex-col">
      <Link href={`/product/${product.slug}`} className="block">
        <ProductMark
          product={product}
          imageUrl={imageFor(product.slug)}
          className="aspect-[4/5]"
        />
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl leading-none">
            <Link href={`/product/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {product.kind} · {product.size}
          </p>
        </div>
        <Price usd={price} compareAtUsd={compareAt} />
      </div>
      <p className="mt-3 text-sm leading-6 text-foreground/80">{product.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {soldOut ? <Badge>Sold out</Badge> : null}
        {product.climates.map((climate) => (
          <Badge key={climate} variant="outline">
            {climateLabel[climate]}
          </Badge>
        ))}
      </div>
      <AddToCart slug={product.slug} className="mt-5" />
    </article>
  );
}
