import type { Metadata } from "next";
import { AccountProfile } from "@/components/account-profile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Name, address, and password for a Syanna Cosmetics account.",
};

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Account</p>
      <h1 className="mt-3 mb-8 font-serif text-5xl leading-none">Your profile</h1>
      <AccountProfile />
    </div>
  );
}
