import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "The idea",
  description:
    "A cosmetics brand for people whose skin moves between hot air and dry rooms, and how a company in Thailand could start it.",
};

const steps = [
  {
    title: "Make two products, not twelve.",
    body: "Water Veil and Shade Gel are enough to test whether anyone wants the idea. Day Wash and Cabin Balm can wait for a second run. A manufacturer will ask for a minimum per product, so a short line is the difference between a test and a warehouse.",
  },
  {
    title: "Register a company where the factory and the bank are.",
    body: "A Thai company is the practical door: a local manufacturer, a local bank, and Stripe, which accepts businesses registered in Thailand and can take cards from customers in other countries. Citizenship does not replace a company, a visa that allows the work, or an accountant. Those are questions for a Thai lawyer, not for a website.",
  },
  {
    title: "Order samples before a big batch.",
    body: "Ask a cosmetics manufacturer in Thailand, or a Korean private-label lab, for samples of a watery serum and a gel cream. The formulas on this site are illustrations. A chemist has to write the real ones, check the banned-ingredient lists, and put a real INCI on the label.",
  },
  {
    title: "Sell in Thailand first. Add countries one at a time.",
    body: "Thailand needs a cosmetic notification before you sell here. The European Union and the United Kingdom need a responsible person and a product file before you ship there. The United States needs honest cosmetic labels, and facility listing once sales grow. “Worldwide” is a later setting in the shop, not the opening week.",
  },
];

const questions = [
  {
    q: "Is this a medicine?",
    a: "No. The products are written as cosmetics: clean, comfort, the look of skin. They do not claim to treat acne, eczema, melasma, or aging. Drug claims are how a cosmetics brand gets its payments blocked.",
  },
  {
    q: "Why not sunscreen on day one?",
    a: "Because in the US a product that claims sun protection is a drug, even if the same bottle is a cosmetic in another country. Start with wash, serum, gel, and balm. Add SPF only with a lab that can register it where you actually ship.",
  },
  {
    q: "Can cards work, unlike a restricted category?",
    a: "Ordinary cosmetics are a normal category for Stripe and other card processors, as long as the products are real cosmetics and the claims stay cosmetic. A processor can still review the website. Do not hide ingredients or invent a medical use.",
  },
  {
    q: "Does this preview take payment?",
    a: "No. Checkout stores a practice order in this browser. There is no server, no email, and no card.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">The idea</p>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[0.95] sm:text-6xl">
        A small cosmetics brand for people who live between climates.
      </h1>
      <div className="mt-8 grid gap-8 md:grid-cols-12">
        <p className="text-sm leading-7 text-foreground/80 md:col-span-6">
          The founder picture is specific: a Ukrainian living in Thailand, with
          skin that still expects winter and a city that does not. That is a
          real customer, and not only one person. Expats, people who travel for
          work, and anyone who moves from a cold apartment to a hot street every
          morning already feel the mismatch.
        </p>
        <p className="text-sm leading-7 text-foreground/80 md:col-span-6">
          The brand is not “Thai spa,” and it is not a copy of a Korean routine.
          It is two finishes. Shade Gel for heat. Cabin Balm for dry indoor air.
          Water Veil underneath both. English on the label, because the point is
          to sell past one country once the paperwork for that country exists.
        </p>
      </div>

      <section className="mt-16">
        <h2 className="font-serif text-4xl">How it would actually open</h2>
        <ol className="mt-8 space-y-8">
          {steps.map((step, index) => (
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
          <h2 className="font-serif text-3xl">What to charge, roughly</h2>
          <p className="mt-4 text-sm leading-7">
            The prices in the shop are sample retail, not a quote. A watery serum
            near $36 and a gel cream near $32 leave room for a small brand if the
            jar, the box, the shipper, and the ads still fit under half of that.
            Check the real cost with two manufacturers before you fall in love
            with a price.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-3xl">What not to promise</h2>
          <p className="mt-4 text-sm leading-7">
            No before-and-after medical photos. No “repairs the barrier” as if it
            were a prescription. No shipping to every flag on day one. The name
            Room & Sun is a working title: search it as a trademark in Thailand
            and in the countries you will actually sell to before it goes on a
            box.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-4xl">Questions worth asking first</h2>
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
        <Button className="h-12 px-5" nativeButton={false}
          render={<Link href="/shop" />}>
          Walk through the shop
        </Button>
        <Button variant="outline" className="h-12 px-5" nativeButton={false}
          render={<Link href="/routine" />}>
          Read the routine
        </Button>
      </div>
    </div>
  );
}
