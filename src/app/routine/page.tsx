import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routineSteps } from "@/lib/products";

export const metadata: Metadata = {
  title: "Routine",
  description: "How to use Room & Sun when the air changes through the day.",
};

const scenes = [
  {
    ...routineSteps[0],
    body: "Wash off the night. Put Water Veil on damp skin. Shade Gel is the last layer from this line before you go outside. It is a moisturizer for heat, not a shield against the sun.",
  },
  {
    ...routineSteps[1],
    body: "The office is a different climate from the street, even in the same hour. If the cheeks feel tight, add water, not another cleanser. Cabin Balm is optional here: a grain, not a coat.",
  },
  {
    ...routineSteps[2],
    body: "Airplane air is dry in a way Bangkok humidity is not. Water Veil still comes first. Cabin Balm goes on the parts that feel papery. Leave Shade Gel packed until you are back in real heat.",
  },
];

export default function RoutinePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Routine</p>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-none sm:text-6xl">
        Change the last step when the air changes.
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-foreground/80">
        The wash and the serum stay. The finish does not. That is the whole
        method. Patch-test a new product on the inner arm before you put it
        on your face.
      </p>
      <div className="mt-14 space-y-16">
        {scenes.map((scene, index) => (
          <article key={scene.title} className="grid gap-6 border-t border-border pt-8 md:grid-cols-12">
            <p className="font-serif text-5xl text-sun-ink md:col-span-2">0{index + 1}</p>
            <div className="md:col-span-4">
              <h2 className="font-serif text-4xl">{scene.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{scene.air}</p>
            </div>
            <div className="md:col-span-6">
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-6">
                {scene.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="mt-4 text-sm leading-7 text-foreground/80">{scene.body}</p>
              <p className="mt-3 text-sm text-muted-foreground">{scene.note}</p>
            </div>
          </article>
        ))}
      </div>
      <section className="mt-16 border border-border bg-card p-6 md:p-10">
        <h2 className="font-serif text-3xl">Why there is no sunscreen here</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7">
          In some countries sunscreen is a cosmetic. In the United States it is
          an over-the-counter drug, with a different factory registration and a
          different label. A small brand should not pretend one bottle can be
          shipped everywhere. Buy a sunscreen that is already legal where you
          live, and put it on after Shade Gel.
        </p>
        <Button className="mt-6 h-12 px-5" nativeButton={false}
          render={<Link href="/about" />}>
          How the company would open
        </Button>
      </section>
    </div>
  );
}
