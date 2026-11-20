"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { announceAccount, useAccount } from "@/components/account-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountAuth({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { customer, ready } = useAccount();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const register = mode === "register";

  useEffect(() => {
    if (ready && customer) router.replace("/account");
  }, [customer, ready, router]);

  return (
    <form
      className="max-w-sm space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        void (async () => {
          try {
            const response = await fetch(register ? "/api/account/register" : "/api/account/login", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(register ? { name, email, password } : { email, password }),
            });
            const data = (await response.json()) as { error?: string };
            if (!response.ok) {
              setError(data.error ?? "The account could not be opened.");
              return;
            }
            announceAccount();
            router.replace("/account");
            router.refresh();
          } catch {
            setError("The account could not be opened.");
          } finally {
            setBusy(false);
          }
        })();
      }}
    >
      <p className="text-sm leading-6 text-muted-foreground">
        {register
          ? "An account keeps the orders you place while signed in, and lets you follow packing and shipping."
          : "Sign in to see your orders and the address saved on the profile."}
      </p>
      {register ? (
        <Field label="Name" htmlFor="account-name">
          <Input id="account-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="h-11" />
        </Field>
      ) : null}
      <Field label="Email" htmlFor="account-email">
        <Input
          id="account-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11"
        />
      </Field>
      <Field label="Password" htmlFor="account-password">
        <Input
          id="account-password"
          type="password"
          autoComplete={register ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11"
        />
      </Field>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="h-11 px-5" disabled={busy}>
        {busy ? "Opening…" : register ? "Create account" : "Sign in"}
      </Button>
      <p className="text-sm">
        {register ? (
          <Link href="/account/login" className="underline-offset-4 hover:underline">
            I already have an account
          </Link>
        ) : (
          <Link href="/account/register" className="underline-offset-4 hover:underline">
            Create an account
          </Link>
        )}
      </p>
    </form>
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
