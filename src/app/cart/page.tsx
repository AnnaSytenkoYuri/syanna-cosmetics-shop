import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Bag",
  description: "Products saved in this browser.",
};

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Bag</p>
      <h1 className="mt-3 font-serif text-5xl leading-none">Your bag</h1>
      <div className="mt-10">
        <CartView />
      </div>
    </div>
  );
}
