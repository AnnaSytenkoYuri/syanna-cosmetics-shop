import type { Metadata } from "next";
import { AccountAuth } from "@/components/account-auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Room & Sun to see your orders.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Account</p>
      <h1 className="mt-3 mb-8 font-serif text-5xl leading-none">Sign in</h1>
      <AccountAuth mode="login" />
    </div>
  );
}
