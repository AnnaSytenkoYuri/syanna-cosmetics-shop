import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Syanna Cosmetics is an international skincare brand. Climate Care is the first collection, and nothing is for sale yet.",
};

const order = [
  {
    title: "Water Veil",
    body: "The planned first product. A hydrating serum. The formula on this site is a sample.",
  },
  {
    title: "Shade Gel",
    body: "The planned second product. A lightweight moisturizer for heat. It is not sunscreen.",
  },
  {
    title: "Day Wash and Cabin Balm",
    body: "Later in the collection. They stay on the site so the idea can be read. They are not for sale.",
  },
];

const questions = [
  {
    q: "Is this a medicine?",
    a: "No. The writing stays with cosmetic care: clean skin, comfort, and how a product feels. It does not claim to treat acne, eczema, melasma, or aging.",
  },
  {
    q: "Why is there no sunscreen?",
    a: "Climate Care does not include a sunscreen. Sun protection is a separate product, and it is not part of this preview.",
  },
  {
    q: "Can I buy these products?",
    a: "No. The formulas are samples. Manufacturing, documentation, and regulatory review are not finished, so the site does not take an order.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">About</p>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[0.95] sm:text-6xl">
        Syanna Cosmetics
      </h1>
      <div className="mt-8 grid gap-8 md:grid-cols-12">
        <p className="text-sm leading-7 text-foreground/80 md:col-span-6">
          Syanna is an international skincare brand for people who move between
          hot, humid air outside and dry air-conditioned rooms. Climate Care is
          the first collection. The method is short: keep the watery layer, and
          change the last step when the air changes.
        </p>
        <p className="text-sm leading-7 text-foreground/80 md:col-span-6">
          Written in Bangkok, by skin that still remembers a January. That
          sentence is the founder line. The brand is not limited to one country,
          and this site is not a shop. Nothing here is for sale.
        </p>
      </div>

      <section className="mt-16">
        <h2 className="font-serif text-4xl">Climate Care</h2>
        <ol className="mt-8 space-y-8">
          {order.map((step, index) => (
            <li key={step.title} className="grid gap-3 border-t border-border pt-6 md:grid-cols-12">
              <p className="font-serif text-3xl text-sun-ink md:col-span-1">0{index + 1}</p>
              <h3 className="font-serif text-2xl md:col-span-4">{step.title}</h3>
              <p className="text-sm leading-7 text-foreground/80 md:col-span-7">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 grid gap-10 border border-border bg-card p-6 md:grid-cols-2 md:p-10">
        <div>
          <h2 className="font-serif text-3xl">What the formulas are</h2>
          <p className="mt-4 text-sm leading-7">
            Each product page shows a sample formula. It is not a finished
            product, not a production specification, and not something you can buy.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-3xl">What Syanna will not claim</h2>
          <p className="mt-4 text-sm leading-7">
            No medicine. No sunscreen in this collection. No reviews, no
            certificates, and no promise that a price is final.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-4xl">Questions</h2>
        <div className="mt-6 divide-y divide-border border-y border-border">
          {questions.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="cursor-pointer font-serif text-2xl">{item.q}</summary>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/80">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button className="h-12 px-5" nativeButton={false} render={<Link href="/product/water-veil" />}>
          Read Water Veil
        </Button>
        <Button variant="outline" className="h-12 px-5" nativeButton={false} render={<Link href="/shop" />}>
          See the collection
        </Button>
      </div>
    </div>
  );
}
