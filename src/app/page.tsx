import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { ProductMark } from "@/components/product-mark";
import { Button } from "@/components/ui/button";
import { getProduct, routineSteps } from "@/lib/products";

export default function HomePage() {
  const veil = getProduct("water-veil");
  const rest = ["shade-gel", "day-wash", "cabin-balm", "two-weather-set"]
    .map((slug) => getProduct(slug))
    .filter((product) => product !== undefined);

  return (
    <div>
      <section className="mx-auto grid w-full max-w-6xl items-end gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Syanna Cosmetics · Climate Care
          </p>
          <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[0.95] text-balance sm:text-7xl">
            Your skin lives in two weathers.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-foreground/80">
            An international skincare brand. Climate Care is the first collection:
            humid streets, dry rooms, and the flight between them. Water Veil is
            the product planned first. Nothing is for sale yet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              className="h-12 px-5"
              nativeButton={false}
              render={<Link href="/product/water-veil" />}
            >
              Read Water Veil
            </Button>
            <Button
              variant="outline"
              className="h-12 px-5"
              nativeButton={false}
              render={<Link href="/shop" />}
            >
              See the collection
            </Button>
          </div>
        </div>
        <div className="grid min-h-[420px] overflow-hidden border border-border sm:grid-cols-2 lg:col-span-6">
          <div className="flex flex-col justify-between bg-sun p-6 text-sun-ink">
            <p className="text-xs tracking-[0.18em] uppercase">Outside</p>
            <div>
              <p className="font-serif text-7xl leading-none">33°</p>
              <p className="mt-3 max-w-[16rem] text-sm leading-6">
                Humid street air. A gel cream that does not slide into your eyes.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between bg-room p-6 text-room-ink">
            <p className="text-xs tracking-[0.18em] uppercase">Inside</p>
            <div>
              <p className="font-serif text-7xl leading-none">22°</p>
              <p className="mt-3 max-w-[16rem] text-sm leading-6">
                Office, hotel, airplane. Dry air. Water first, then a grain of balm.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:px-8">
          <div>
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
              The mismatch
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight">
              Creams from a cold country feel like a coat at noon.
            </h2>
          </div>
          <p className="text-sm leading-7 text-foreground/80 md:pt-8">
            Skin that grew up in a continental winter and now lives in Thai heat
            does a strange thing. The jar from home is too rich by 10am. The
            light gel from a pharmacy feels like nothing after an afternoon in
            recycled air. Climate Care is that gap: two finishes, chosen by the
            air you are about to walk into.
          </p>
        </div>
      </section>

      {veil ? (
        <section className="bg-moss text-primary-foreground">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 md:px-8 lg:grid-cols-2">
            <ProductMark product={veil} className="aspect-[5/4]" />
            <div>
              <p className="text-xs tracking-[0.18em] uppercase opacity-70">
                Planned first product
              </p>
              <h2 className="mt-3 font-serif text-5xl leading-none">
                Water Veil
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 opacity-90">
                A hydrating serum for Climate Care. The formula is a sample.
                It is not a finished product and not for sale.
              </p>
              <Price
                usd={veil.priceUsd}
                slug={veil.slug}
                className="mt-6 text-base text-primary-foreground"
              />
              <p className="mt-2 text-xs opacity-80">Concept price. Not a selling price.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <AddToCart
                  slug={veil.slug}
                  buttonClassName="bg-background text-foreground hover:bg-background/90"
                />
                <Button
                  variant="outline"
                  className="h-12 border-background/30 bg-transparent px-5 text-background hover:bg-background/10"
                  nativeButton={false}
                  render={<Link href={`/product/${veil.slug}`} />}
                >
                  Read Water Veil
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-serif text-4xl">The collection</h2>
          <Link href="/shop" className="text-sm underline-offset-4 hover:underline">
            All products
          </Link>
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2">
          {rest.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8">
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            One day
          </p>
          <h2 className="mt-3 max-w-lg font-serif text-4xl leading-tight">
            Same face. Three kinds of air.
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {routineSteps.map((step, index) => (
              <li key={step.title} className="border-t border-border pt-5">
                <p className="font-serif text-3xl text-sun-ink">0{index + 1}</p>
                <h3 className="mt-3 font-serif text-2xl">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.air}</p>
                <p className="mt-4 text-sm leading-6">{step.steps.join(" · ")}</p>
              </li>
            ))}
          </ol>
          <Button
            variant="outline"
            className="mt-10 h-12 px-5"
            nativeButton={false}
              render={<Link href="/routine" />}
          >
            The full routine
          </Button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 md:grid-cols-12 md:px-8">
        <h2 className="font-serif text-4xl leading-tight md:col-span-5">
          Written in Bangkok, by skin that still remembers a January.
        </h2>
        <div className="text-sm leading-7 text-foreground/80 md:col-span-6 md:col-start-7">
          <p>
            Syanna Cosmetics is an international skincare brand for people who
            move between hot, humid air and dry air-conditioned rooms. This
            site is a preview of Climate Care. Nothing is for sale.
          </p>
          <Link href="/about" className="mt-6 inline-block underline-offset-4 hover:underline">
            About Syanna
          </Link>
        </div>
      </section>
    </div>
  );
}
