"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/money";

type ListingRow = {
  slug: string;
  name: string;
  kind: string;
  priceUsd: number;
  stock: number;
  imageUrl: string;
};

type SavedOrder = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  country: string;
  city: string;
  totalUsd: number;
  shippingUsd: number;
  shippingDays: string;
  emailStatus: "saved" | "sent" | "failed";
  lines: { name: string; qty: number }[];
};

const emailLabel = {
  saved: "Saved, email not sent",
  sent: "Emailed",
  failed: "Email failed",
};

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState(false);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    void fetch("/api/admin/session")
      .then((response) => response.json())
      .then((data: { signedIn?: boolean; devFallback?: boolean; configured?: boolean }) => {
        if (data.signedIn) router.replace("/admin");
        setHint(Boolean(data.devFallback));
        setConfigured(data.configured !== false);
      })
      .catch(() => setError("The shop desk could not be reached."));
  }, [router]);

  return (
    <form
      className="max-w-sm space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        void (async () => {
          try {
            const response = await fetch("/api/admin/login", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ password }),
            });
            if (!response.ok) {
              const data = (await response.json()) as { error?: string };
              setError(data.error ?? "That password does not match.");
              return;
            }
            router.replace("/admin");
            router.refresh();
          } catch {
            setError("The shop desk could not be reached.");
          } finally {
            setBusy(false);
          }
        })();
      }}
    >
      <p className="text-sm leading-6 text-muted-foreground">
        {configured
          ? "This desk edits the demo prices, photos, and stock, and lists saved orders."
          : "Set ADMIN_PASSWORD before this desk can open."}
      </p>
      {hint ? (
        <p className="text-sm leading-6">
          On this computer the password is <span className="font-medium">demo</span> until you set
          ADMIN_PASSWORD.
        </p>
      ) : null}
      <Input
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="h-11"
        aria-label="Password"
        disabled={!configured}
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="h-11 px-5" disabled={busy || !configured}>
        {busy ? "Opening…" : "Open the desk"}
      </Button>
    </form>
  );
}

export function AdminDesk() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<ListingRow[]>([]);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void (async () => {
      const session = await fetch("/api/admin/session");
      const gate = (await session.json()) as { signedIn?: boolean };
      if (!gate.signedIn) {
        router.replace("/admin/login");
        return;
      }
      const [productResponse, orderResponse] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
      ]);
      if (productResponse.status === 401 || orderResponse.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const productData = (await productResponse.json()) as { products?: ListingRow[]; error?: string };
      const orderData = (await orderResponse.json()) as { orders?: SavedOrder[] };
      if (!productResponse.ok || !productData.products) {
        setError(productData.error ?? "The products could not be loaded.");
        setReady(true);
        return;
      }
      setProducts(productData.products);
      setOrders(orderData.orders ?? []);
      setReady(true);
    })();
  }, [router]);

  function edit(slug: string, patch: Partial<ListingRow>) {
    setProducts((current) =>
      current.map((product) => (product.slug === slug ? { ...product, ...patch } : product)),
    );
  }

  if (!ready) return <div className="h-64 animate-pulse bg-muted" />;

  return (
    <div className="space-y-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          Changes stay in the demo file on this computer. A photo needs an https address.
          Orders below are the ones customers placed in this demo.
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4"
          onClick={() => {
            void fetch("/api/admin/logout", { method: "POST" }).finally(() => {
              router.replace("/admin/login");
              router.refresh();
            });
          }}
        >
          Sign out
        </Button>
      </div>
      {error ? (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? <p className="text-sm">{notice}</p> : null}

      <section>
        <h2 className="font-serif text-3xl">Products</h2>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {products.map((product) => (
            <li key={product.slug} className="grid gap-3 py-5 md:grid-cols-[1.1fr_0.6fr_0.5fr_1.4fr_auto] md:items-end">
              <div>
                <p className="font-serif text-2xl leading-none">{product.name}</p>
                <p className="mt-2 text-xs text-muted-foreground">{product.kind}</p>
              </div>
              <label className="text-xs text-muted-foreground">
                Price, USD
                <Input
                  inputMode="decimal"
                  value={String(product.priceUsd)}
                  onChange={(event) => edit(product.slug, { priceUsd: Number(event.target.value) })}
                  className="mt-1 h-10"
                />
              </label>
              <label className="text-xs text-muted-foreground">
                Stock
                <Input
                  inputMode="numeric"
                  value={String(product.stock)}
                  onChange={(event) => edit(product.slug, { stock: Number(event.target.value) })}
                  className="mt-1 h-10"
                />
              </label>
              <label className="text-xs text-muted-foreground">
                Photo URL
                <Input
                  value={product.imageUrl}
                  placeholder="https://"
                  onChange={(event) => edit(product.slug, { imageUrl: event.target.value })}
                  className="mt-1 h-10"
                />
              </label>
              <Button
                type="button"
                className="h-10 px-4"
                onClick={() => {
                  setError("");
                  setNotice("");
                  void (async () => {
                    const response = await fetch("/api/admin/products", {
                      method: "PATCH",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({
                        slug: product.slug,
                        priceUsd: product.priceUsd,
                        stock: product.stock,
                        imageUrl: product.imageUrl,
                      }),
                    });
                    const data = (await response.json()) as { error?: string };
                    if (!response.ok) {
                      setError(data.error ?? "The product could not be saved.");
                      return;
                    }
                    setNotice(`${product.name} saved.`);
                    window.dispatchEvent(new Event("rs-catalog"));
                  })();
                }}
              >
                Save
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-3xl">Orders</h2>
        {orders.length === 0 ? (
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            No demo orders yet.{" "}
            <Link href="/shop" className="underline-offset-4 hover:underline">
              Place one from the shop
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {orders.map((order) => (
              <li key={order.id} className="py-5 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-medium">
                    {order.id} · {order.name}
                  </p>
                  <p className="tabular-nums">{formatMoney(order.totalUsd, "USD")}</p>
                </div>
                <p className="mt-2 text-muted-foreground">
                  {order.city}, {order.country} · shipping {formatMoney(order.shippingUsd, "USD")},{" "}
                  {order.shippingDays} · {emailLabel[order.emailStatus]}
                </p>
                <p className="mt-1 text-muted-foreground">{order.email}</p>
                <p className="mt-2">
                  {order.lines.map((line) => `${line.name} × ${line.qty}`).join(", ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
