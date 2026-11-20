import Link from "next/link";
import { orderStatusLabel, trackingSteps, type OrderEvent, type OrderStatus } from "@/lib/order-status";
import { formatMoney, type Currency } from "@/lib/money";
import { cn } from "@/lib/utils";

export type TrackedOrder = {
  id: string;
  createdAt: string;
  customerId: string | null;
  name: string;
  city: string;
  country: string;
  address: string;
  currency: Currency;
  lines: { slug: string; name: string; qty: number; unitUsd: number }[];
  shippingUsd: number;
  shippingDays: string;
  totalUsd: number;
  status: OrderStatus;
  trackingNumber: string;
  events: OrderEvent[];
};

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrderTrack({ order }: { order: TrackedOrder }) {
  const cancelled = order.status === "cancelled";
  const current = trackingSteps.indexOf(order.status);

  return (
    <div>
      <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{order.id}</p>
      <h2 className="mt-3 font-serif text-4xl leading-none">{orderStatusLabel[order.status]}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {order.name}, {order.address}, {order.city}, {order.country}. Times are Bangkok time.
      </p>
      <ol className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {trackingSteps.map((step, index) => {
          const reached = !cancelled && current >= index;
          return (
            <li
              key={step}
              className={cn(
                "border px-3 py-4 text-sm",
                reached ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
              )}
            >
              <span className="block text-[11px] tracking-[0.14em] uppercase">{index + 1}</span>
              <span className="mt-2 block font-medium">{orderStatusLabel[step]}</span>
            </li>
          );
        })}
      </ol>
      {cancelled ? (
        <p className="mt-4 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
          This order was cancelled. A charged shop would return the payment here. This demo never took one.
        </p>
      ) : null}
      <p className="mt-6 text-sm leading-6">
        {order.trackingNumber
          ? `Tracking number ${order.trackingNumber}. ${order.shippingDays}.`
          : `A tracking number shows up when the desk marks the parcel shipped. ${order.shippingDays}.`}
      </p>
      <ul className="mt-6 divide-y divide-border border-y border-border text-sm">
        {[...order.events].reverse().map((event, index) => (
          <li key={`${event.at}-${event.status}-${index}`} className="py-3">
            <p>
              {orderStatusLabel[event.status]}
              <span className="ml-2 text-muted-foreground">{when(event.at)}</span>
            </p>
            {event.note ? <p className="mt-1 text-muted-foreground">{event.note}</p> : null}
          </li>
        ))}
      </ul>
      <ul className="mt-6 space-y-2 text-sm">
        {order.lines.map((line) => (
          <li key={line.slug} className="flex justify-between gap-4">
            <Link href={`/product/${line.slug}`} className="hover:underline">
              {line.name} × {line.qty}
            </Link>
            <span className="tabular-nums">{formatMoney(line.unitUsd * line.qty, order.currency)}</span>
          </li>
        ))}
        <li className="flex justify-between gap-4 text-muted-foreground">
          <span>Shipping</span>
          <span className="tabular-nums">{formatMoney(order.shippingUsd, order.currency)}</span>
        </li>
        <li className="flex justify-between gap-4 font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatMoney(order.totalUsd, order.currency)}</span>
        </li>
      </ul>
    </div>
  );
}
