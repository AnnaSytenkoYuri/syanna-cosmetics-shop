import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin-desk";

export const metadata: Metadata = {
  title: "Shop desk",
  description: "Sign in to edit the Syanna Cosmetics demo.",
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Shop desk</p>
      <h1 className="mt-3 mb-8 font-serif text-5xl leading-none">Sign in</h1>
      <AdminLogin />
    </div>
  );
}
