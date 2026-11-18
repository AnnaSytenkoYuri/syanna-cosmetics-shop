"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-24 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Something broke</p>
      <h1 className="mt-3 font-serif text-5xl leading-none">This page did not load.</h1>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        The shop is still there. Try the page again.
        {error.digest ? ` Reference ${error.digest}.` : null}
      </p>
      <Button className="mt-8 h-12 px-5" type="button" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
