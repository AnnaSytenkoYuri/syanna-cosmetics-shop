"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountNav } from "@/components/account-nav";
import { useAccount } from "@/components/account-session";
import { OrderTrack, type TrackedOrder } from "@/components/order-track";
import { orderStatusLabel } from "@/lib/order-status";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";

export function AccountOrders() {
  const router = useRouter();
  const { customer, ready } = useAccount();
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (!customer) return;
    void fetch("/api/account/orders")
      .then((response) => response.json())
      .then((data: { orders?: TrackedOrder[] }) => {
        setOrders(data.orders ?? []);
        setLoaded(true);
      });
  }, [customer]);

  useEffect(() => {
    if (!ready || customer) {
      redirected.current = false;
      return;
    }
    if (redirected.current) return;
    redirected.current = true;
    router.replace("/account/login");
  }, [customer, ready, router]);

  if (!ready || !customer || !loaded) return <div className="h-64 animate-pulse bg-muted" />;

  return (
    <div className="grid gap-10 md:grid-cols-[220px_1fr]">
      <AccountNav />
      <div>
        {orders.length === 0 ? (
          <div className="border border-dashed border-border px-6 py-16">
            <p className="font-serif text-4xl">No orders in this account yet.</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Sign in before checkout and the order stays here, with a status the shop desk can move forward.
            </p>
            <Button className="mt-8 h-12 px-5" nativeButton={false} render={<Link href="/shop" />}>
              Browse the shop
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-baseline justify-between gap-3 py-5">
                <div>
                  <Link href={`/account/orders/${order.id}`} className="font-medium hover:underline">
                    {order.id}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {orderStatusLabel[order.status]} · {order.lines.map((line) => line.name).join(", ")}
                  </p>
                </div>
                <p className="text-sm tabular-nums">{formatMoney(order.totalUsd, order.currency)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function AccountOrder({ id }: { id: string }) {
  const router = useRouter();
  const { customer, ready } = useAccount();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [missing, setMissing] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (!customer) return;
    void fetch(`/api/account/orders/${id}`).then(async (response) => {
      if (!response.ok) {
        setMissing(true);
        return;
      }
      const data = (await response.json()) as { order: TrackedOrder };
      setOrder(data.order);
    });
  }, [customer, id]);

  useEffect(() => {
    if (!ready || customer) {
      redirected.current = false;
      return;
    }
    if (redirected.current) return;
    redirected.current = true;
    router.replace("/account/login");
  }, [customer, ready, router]);

  if (!ready || !customer || (!order && !missing)) return <div className="h-64 animate-pulse bg-muted" />;

  return (
    <div className="grid gap-10 md:grid-cols-[220px_1fr]">
      <AccountNav />
      <div>
        {missing || !order ? (
          <p className="text-sm">That order is not in this account.</p>
        ) : (
          <OrderTrack order={order} />
        )}
      </div>
    </div>
  );
}
