import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCart } from "@/components/add-to-cart";
import { StockNote } from "@/components/stock-note";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { ProductMark } from "@/components/product-mark";
import { Badge } from "@/components/ui/badge";
import {
  climateLabel,
  getProduct,
  products,
  relatedProducts,
} from "@/lib/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product" };
  return { title: product.name, description: product.summary };
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<ProductFallback />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

function ProductFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8" aria-hidden="true">
      <div className="h-4 w-24 animate-pulse bg-muted" />
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="aspect-[4/5] animate-pulse bg-muted" />
        <div className="h-80 animate-pulse bg-muted" />
      </div>
    </div>
  );
}

async function ProductContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = relatedProducts(product.slug);
  const included = (product.includes ?? [])
    .map((item) => getProduct(item))
    .filter((item) => item !== undefined);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8">
      <p className="text-sm text-muted-foreground">
        <Link href="/shop" className="hover:underline">
          Shop
        </Link>
        <span aria-hidden="true"> / </span>
        {product.name}
      </p>
      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="lg:sticky lg:top-32">
          <ProductMark product={product} className="aspect-[4/5]" />
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {product.climates.map((climate) => (
              <Badge key={climate} variant="outline">
                {climateLabel[climate]}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 font-serif text-5xl leading-none sm:text-6xl">
            {product.name}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {product.kind} · {product.texture} · {product.size}
          </p>
          <Price
            usd={product.priceUsd}
            compareAtUsd={product.compareAtUsd}
            slug={product.slug}
            className="mt-5 text-base"
          />
          <p className="mt-6 text-base leading-7">{product.summary}</p>
          <p className="mt-4 text-sm leading-7 text-foreground/80">{product.detail}</p>
          <AddToCart slug={product.slug} withQty className="mt-8" />
          <StockNote slug={product.slug} />

          <h2 className="mt-12 font-serif text-3xl">How to use it</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6">
            {product.use.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{product.skip}</p>

          {included.length > 0 ? (
            <div className="mt-10">
              <h2 className="font-serif text-3xl">In the set</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {included.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/product/${item.slug}`} className="underline-offset-4 hover:underline">
                      {item.name}
                    </Link>
                    <span className="text-muted-foreground"> — {item.kind}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <h2 className="mt-12 font-serif text-3xl">What is in the sample</h2>
          <ul className="mt-4 space-y-4">
            {product.ingredients.map((ingredient) => (
              <li key={ingredient.name}>
                <p className="text-sm font-medium">{ingredient.name}</p>
                <p className="text-sm leading-6 text-muted-foreground">{ingredient.note}</p>
              </li>
            ))}
          </ul>
          <details className="mt-6 border-t border-border pt-4 text-sm">
            <summary className="cursor-pointer">Sample ingredient list</summary>
            <p className="mt-3 leading-6 text-muted-foreground">{product.inci}</p>
          </details>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-20">
          <h2 className="font-serif text-4xl">Alongside it</h2>
          <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
