import type { Metadata } from "next";
import { AccountAuth } from "@/components/account-auth";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Room & Sun account for order history and tracking.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Account</p>
      <h1 className="mt-3 mb-8 font-serif text-5xl leading-none">Create an account</h1>
      <AccountAuth mode="register" />
    </div>
  );
}
