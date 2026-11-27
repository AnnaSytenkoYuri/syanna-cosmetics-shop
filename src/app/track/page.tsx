import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackLookup } from "@/components/track-lookup";

export const metadata: Metadata = {
  title: "Track",
  description: "Look up a Syanna Cosmetics parcel with the order number and email.",
};

export default function TrackPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Tracking</p>
      <h1 className="mt-3 mb-8 font-serif text-5xl leading-none">Follow a parcel</h1>
      <Suspense fallback={<div className="h-40 animate-pulse bg-muted" />}>
        <TrackLookup />
      </Suspense>
    </div>
  );
}
