import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "A demo checkout. Shipping by country, no card charge.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Checkout</p>
      <h1 className="mt-3 mb-10 font-serif text-5xl leading-none">Preview order</h1>
      <CheckoutForm />
    </div>
  );
}
