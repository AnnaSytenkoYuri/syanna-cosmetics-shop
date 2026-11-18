"use client";

import { useState } from "react";
import Link from "next/link";
import { Price } from "@/components/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useShop, type PreviewOrder } from "@/components/shop-provider";
import { formatMoney } from "@/lib/money";

const countries = [
  "Thailand",
  "Ukraine",
  "Singapore",
  "Malaysia",
  "Japan",
  "South Korea",
  "Germany",
  "France",
  "Netherlands",
  "Poland",
  "United Kingdom",
  "United States",
  "Australia",
  "Somewhere else",
];

type Field = "name" | "email" | "country" | "city" | "address";

const empty = {
  name: "",
  email: "",
  country: "",
  city: "",
  address: "",
  note: "",
};

function validate(values: typeof empty) {
  const errors: Partial<Record<Field, string>> = {};
  if (values.name.trim().length < 2) errors.name = "Add the name for the parcel.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Add an email that looks complete.";
  }
  if (!values.country) errors.country = "Choose a country.";
  if (values.city.trim().length < 2) errors.city = "Add a city.";
  if (values.address.trim().length < 5) errors.address = "Add a street address.";
  return errors;
}

export function CheckoutForm() {
  const { hydrated, items, totalUsd, currency, placeOrder } = useShop();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [order, setOrder] = useState<PreviewOrder | null>(null);

  if (!hydrated) {
    return <div className="h-80 animate-pulse bg-muted" />;
  }

  if (order) {
    return (
      <div className="max-w-xl">
        <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
          Preview order {order.id}
        </p>
        <p className="mt-3 font-serif text-5xl leading-none">Saved in this browser.</p>
        <p className="mt-4 text-sm leading-6">
          Nothing was charged. No email was sent. The order lives only on this
          device, so another phone will not see it.
        </p>
        <ul className="mt-8 divide-y divide-border border-y border-border text-sm">
          {order.lines.map((line) => (
            <li key={line.slug} className="flex justify-between gap-4 py-3">
              <span>
                {line.name} × {line.qty}
              </span>
              <span className="tabular-nums">
                {formatMoney(line.unitUsd * line.qty, order.currency)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between text-sm">
          <span>Total</span>
          <span className="font-medium tabular-nums">
            {formatMoney(order.totalUsd, order.currency)}
          </span>
        </p>
        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          {order.name}, {order.city}, {order.country}. A real shop would confirm
          the address, the label rules for that country, and a card payment
          after the company is approved by a processor.
        </p>
        <Button className="mt-8 h-12 px-5" nativeButton={false}
          render={<Link href="/shop" />}>
          Back to the shop
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-border px-6 py-16">
        <p className="font-serif text-4xl">Nothing to check out.</p>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Add a product first. Checkout on this preview only stores a practice
          order in the browser.
        </p>
        <Button className="mt-8 h-12 px-5" nativeButton={false}
          render={<Link href="/shop" />}>
          Browse the shop
        </Button>
      </div>
    );
  }

  function update(field: keyof typeof empty, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <form
      className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]"
      onSubmit={(event) => {
        event.preventDefault();
        const nextErrors = validate(values);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;
        const placed = placeOrder({
          name: values.name.trim(),
          email: values.email.trim(),
          country: values.country,
          city: values.city.trim(),
          address: values.address.trim(),
          note: values.note.trim(),
        });
        if (placed) setOrder(placed);
      }}
      noValidate
    >
      <div className="space-y-5">
        {Object.keys(errors).length > 0 ? (
          <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm" role="alert">
            The form still needs a few details.
          </p>
        ) : null}
        <Field label="Full name" error={errors.name} htmlFor="name">
          <Input
            id="name"
            name="name"
            autoComplete="name"
            value={values.name}
            aria-invalid={Boolean(errors.name)}
            onChange={(event) => update("name", event.target.value)}
            className="h-11"
          />
        </Field>
        <Field label="Email" error={errors.email} htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            aria-invalid={Boolean(errors.email)}
            onChange={(event) => update("email", event.target.value)}
            className="h-11"
          />
        </Field>
        <Field label="Country" error={errors.country} htmlFor="country">
          <select
            id="country"
            name="country"
            value={values.country}
            aria-invalid={Boolean(errors.country)}
            onChange={(event) => update("country", event.target.value)}
            className="h-11 w-full border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </Field>
        {values.country === "United States" ? (
          <p className="text-sm leading-6 text-muted-foreground">
            Cosmetics sold into the US need correct labels and, past a small
            sales line, an FDA listing. This preview does not check that.
            Sunscreen is a separate, harder product and is not in this shop.
          </p>
        ) : null}
        {values.country === "Somewhere else" ? (
          <p className="text-sm leading-6 text-muted-foreground">
            A live shop would confirm this country before taking payment. Import
            rules for cosmetics are not the same everywhere.
          </p>
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City" error={errors.city} htmlFor="city">
            <Input
              id="city"
              name="city"
              autoComplete="address-level2"
              value={values.city}
              aria-invalid={Boolean(errors.city)}
              onChange={(event) => update("city", event.target.value)}
              className="h-11"
            />
          </Field>
          <Field label="Street address" error={errors.address} htmlFor="address">
            <Input
              id="address"
              name="address"
              autoComplete="street-address"
              value={values.address}
              aria-invalid={Boolean(errors.address)}
              onChange={(event) => update("address", event.target.value)}
              className="h-11"
            />
          </Field>
        </div>
        <Field label="Note for the brand (optional)" htmlFor="note">
          <Input
            id="note"
            name="note"
            value={values.note}
            onChange={(event) => update("note", event.target.value)}
            className="h-11"
            placeholder="Skin that moves between winter and Bangkok heat"
          />
        </Field>
        <Button type="submit" className="h-12 px-6">
          Place a preview order
        </Button>
      </div>
      <aside className="h-fit border border-border p-6">
        <h2 className="font-serif text-2xl">In the bag</h2>
        <Separator className="my-4" />
        <ul className="space-y-3 text-sm">
          {items.map(({ product, qty }) => (
            <li key={product.slug} className="flex justify-between gap-4">
              <span>
                {product.name} × {qty}
              </span>
              <Price usd={product.priceUsd * qty} />
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <div className="flex justify-between text-sm">
          <span>Total in {currency}</span>
          <Price usd={totalUsd} />
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Practice checkout only. Your details stay in this browser and are not
          sent to a server.
        </p>
      </aside>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
