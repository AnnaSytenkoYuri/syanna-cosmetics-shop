import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountOrder } from "@/components/account-orders";

export const metadata: Metadata = {
  title: "Order",
  description: "Status and tracking for a Room & Sun order.",
};

export default function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
          <div className="h-64 animate-pulse bg-muted" />
        </div>
      }
    >
      <OrderContent params={params} />
    </Suspense>
  );
}

async function OrderContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Account</p>
      <h1 className="mt-3 mb-8 font-serif text-5xl leading-none">Order</h1>
      <AccountOrder id={id} />
    </div>
  );
}
