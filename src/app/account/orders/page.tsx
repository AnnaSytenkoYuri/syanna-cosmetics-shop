import type { Metadata } from "next";
import { AccountOrders } from "@/components/account-orders";

export const metadata: Metadata = {
  title: "Orders",
  description: "Orders placed while signed in to Syanna Cosmetics.",
};

export default function OrdersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Account</p>
      <h1 className="mt-3 mb-8 font-serif text-5xl leading-none">Your orders</h1>
      <AccountOrders />
    </div>
  );
}
