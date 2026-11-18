import type { Metadata } from "next";
import { ShopBrowser } from "@/components/shop-browser";

export const metadata: Metadata = {
  title: "Shop",
  description: "Gel cleanser, watery serum, heat gel, and a small balm for dry indoor air.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Shop</p>
      <h1 className="mt-3 max-w-2xl font-serif text-5xl leading-none sm:text-6xl">
        Four products. One is a set of three.
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-foreground/80">
        Filter by the air you are about to be in. Humid air, a cold room, or a
        day of travel. Prices are samples for the preview.
      </p>
      <div className="mt-10">
        <ShopBrowser />
      </div>
    </div>
  );
}
