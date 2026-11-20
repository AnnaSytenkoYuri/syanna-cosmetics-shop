"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { OrderTrack, type TrackedOrder } from "@/components/order-track";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TrackLookup() {
  const params = useSearchParams();
  const [id, setId] = useState(params.get("order") ?? "");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          void (async () => {
            try {
              const response = await fetch("/api/track", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id, email }),
              });
              const data = (await response.json()) as { order?: TrackedOrder; error?: string };
              if (!response.ok || !data.order) {
                setOrder(null);
                setError(data.error ?? "No order matches that number and email.");
                return;
              }
              setOrder(data.order);
            } catch {
              setError("The lookup could not be completed.");
            } finally {
              setBusy(false);
            }
          })();
        }}
      >
        <p className="text-sm leading-6 text-muted-foreground">
          Guests can follow a parcel with the order number and the email used at checkout. A signed-in order also lives in the account.
        </p>
        <div className="space-y-2">
          <Label htmlFor="track-id">Order number</Label>
          <Input id="track-id" value={id} onChange={(event) => setId(event.target.value)} className="h-11" placeholder="RS-" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="track-email">Email</Label>
          <Input id="track-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11" />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="h-11 px-5" disabled={busy}>
          {busy ? "Looking…" : "Show the parcel"}
        </Button>
      </form>
      <div>{order ? <OrderTrack order={order} /> : null}</div>
    </div>
  );
}
