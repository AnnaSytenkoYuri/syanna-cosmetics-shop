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
        Climate Care
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-foreground/80">
        The first Syanna collection, for humid air, dry rooms, and travel.
        Water Veil is the planned first product. Nothing here is for sale.
      </p>
      <div className="mt-10">
        <ShopBrowser />
      </div>
    </div>
  );
}
