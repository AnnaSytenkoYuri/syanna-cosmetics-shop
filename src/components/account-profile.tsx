"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountNav } from "@/components/account-nav";
import { announceAccount, useAccount } from "@/components/account-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shippingCountries } from "@/lib/shipping";

export function AccountProfile() {
  const router = useRouter();
  const { customer, ready } = useAccount();
  const [editing, setEditing] = useState<{
    name: string;
    phone: string;
    country: string;
    city: string;
    address: string;
  } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const redirected = useRef(false);

  useEffect(() => {
    if (!ready || customer) {
      redirected.current = false;
      return;
    }
    if (redirected.current) return;
    redirected.current = true;
    router.replace("/account/login");
  }, [customer, ready, router]);

  if (!ready || !customer) return <div className="h-64 animate-pulse bg-muted" />;
  const form = editing ?? customer;
  function change(patch: Partial<typeof form>) {
    setEditing({ ...form, ...patch });
  }

  return (
    <div className="grid gap-10 md:grid-cols-[220px_1fr]">
      <AccountNav />
      <div className="max-w-xl space-y-10">
        <p className="text-sm leading-6 text-muted-foreground">
          Signed in as {customer.email}. Orders placed from this account stay in the order list. Checkout still does not charge a card.
        </p>
        {error ? (
          <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? <p className="text-sm">{notice}</p> : null}
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            setNotice("");
            void (async () => {
              const response = await fetch("/api/account/profile", {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(form),
              });
              const data = (await response.json()) as { error?: string };
              if (!response.ok) {
                setError(data.error ?? "The profile could not be saved.");
                return;
              }
              setEditing(null);
              announceAccount();
              setNotice("Profile saved. Checkout will offer this address.");
            })();
          }}
        >
          <Field label="Name" htmlFor="profile-name">
            <Input id="profile-name" value={form.name} onChange={(event) => change({ name: event.target.value })} className="h-11" />
          </Field>
          <Field label="Phone" htmlFor="profile-phone">
            <Input id="profile-phone" value={form.phone} onChange={(event) => change({ phone: event.target.value })} className="h-11" />
          </Field>
          <Field label="Country" htmlFor="profile-country">
            <select
              id="profile-country"
              value={form.country}
              onChange={(event) => change({ country: event.target.value })}
              className="h-11 w-full border border-input bg-transparent px-2.5 text-sm outline-none"
            >
              <option value="">No default country</option>
              {shippingCountries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
          <Field label="City" htmlFor="profile-city">
            <Input id="profile-city" value={form.city} onChange={(event) => change({ city: event.target.value })} className="h-11" />
          </Field>
          <Field label="Street address" htmlFor="profile-address">
            <Input id="profile-address" value={form.address} onChange={(event) => change({ address: event.target.value })} className="h-11" />
          </Field>
          <Button type="submit" className="h-11 px-5">
            Save profile
          </Button>
        </form>
        <form
          className="space-y-4 border-t border-border pt-8"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            setNotice("");
            void (async () => {
              const response = await fetch("/api/account/password", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ currentPassword, nextPassword }),
              });
              const data = (await response.json()) as { error?: string };
              if (!response.ok) {
                setError(data.error ?? "The password could not be changed.");
                return;
              }
              setCurrentPassword("");
              setNextPassword("");
              setNotice("Password changed.");
            })();
          }}
        >
          <h2 className="font-serif text-3xl">Password</h2>
          <Field label="Current password" htmlFor="current-password">
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="h-11"
            />
          </Field>
          <Field label="New password" htmlFor="next-password">
            <Input
              id="next-password"
              type="password"
              autoComplete="new-password"
              value={nextPassword}
              onChange={(event) => setNextPassword(event.target.value)}
              className="h-11"
            />
          </Field>
          <Button type="submit" variant="outline" className="h-11 px-5">
            Change password
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
