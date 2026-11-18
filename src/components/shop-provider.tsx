"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { createContext, useContext } from "react";
import { getProduct, type Product } from "@/lib/products";
import type { Currency } from "@/lib/money";

const CART_KEY = "room-and-sun-cart";
const CURRENCY_KEY = "room-and-sun-currency";
const ORDERS_KEY = "room-and-sun-orders";
const MAX_QTY = 6;

export type CartLine = { slug: string; qty: number };

export type PreviewOrder = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  country: string;
  city: string;
  address: string;
  note: string;
  currency: Currency;
  lines: { slug: string; name: string; qty: number; unitUsd: number }[];
  totalUsd: number;
};

type Draft = {
  name: string;
  email: string;
  country: string;
  city: string;
  address: string;
  note: string;
};

type Snapshot = {
  currency: Currency;
  lines: CartLine[];
  orders: PreviewOrder[];
  ready: boolean;
};

const initialSnapshot: Snapshot = {
  currency: "USD",
  lines: [],
  orders: [],
  ready: false,
};

let snapshot: Snapshot = initialSnapshot;
const listeners = new Set<() => void>();

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function sanitizeLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((line) => {
    if (!line || typeof line !== "object") return [];
    const slug = "slug" in line && typeof line.slug === "string" ? line.slug : "";
    const qty = "qty" in line && typeof line.qty === "number" ? Math.floor(line.qty) : 0;
    if (!getProduct(slug) || qty < 1) return [];
    return [{ slug, qty: Math.min(MAX_QTY, qty) }];
  });
}

function sanitizeOrders(value: unknown): PreviewOrder[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((order): order is PreviewOrder => {
      return Boolean(order && typeof order === "object" && "id" in order);
    })
    .slice(0, 8);
}

function persist(next: Snapshot) {
  localStorage.setItem(CART_KEY, JSON.stringify(next.lines));
  localStorage.setItem(CURRENCY_KEY, JSON.stringify(next.currency));
  localStorage.setItem(ORDERS_KEY, JSON.stringify(next.orders));
}

function commit(next: Snapshot) {
  snapshot = next;
  if (typeof window !== "undefined" && next.ready) persist(next);
  listeners.forEach((listener) => listener());
}

function loadFromBrowser() {
  if (snapshot !== initialSnapshot) return;
  const storedCurrency = readJson<unknown>(CURRENCY_KEY, "USD");
  commit({
    currency: storedCurrency === "THB" ? "THB" : "USD",
    lines: sanitizeLines(readJson<unknown>(CART_KEY, [])),
    orders: sanitizeOrders(readJson<unknown>(ORDERS_KEY, [])),
    ready: true,
  });
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return initialSnapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function update(partial: Partial<Pick<Snapshot, "currency" | "lines" | "orders">>) {
  commit({
    currency: partial.currency ?? snapshot.currency,
    lines: partial.lines ?? snapshot.lines,
    orders: partial.orders ?? snapshot.orders,
    ready: true,
  });
}

function add(slug: string, qty = 1) {
  if (!getProduct(slug) || qty < 1) return;
  const existing = snapshot.lines.find((line) => line.slug === slug);
  const lines = existing
    ? snapshot.lines.map((line) =>
        line.slug === slug
          ? { ...line, qty: Math.min(MAX_QTY, line.qty + qty) }
          : line,
      )
    : [...snapshot.lines, { slug, qty: Math.min(MAX_QTY, qty) }];
  update({ lines });
}

function setQty(slug: string, qty: number) {
  update({
    lines: snapshot.lines.flatMap((line) => {
      if (line.slug !== slug) return [line];
      if (qty <= 0) return [];
      return [{ ...line, qty: Math.min(MAX_QTY, Math.floor(qty)) }];
    }),
  });
}

function remove(slug: string) {
  update({ lines: snapshot.lines.filter((line) => line.slug !== slug) });
}

function setCurrency(currency: Currency) {
  update({ currency });
}

function placeOrder(draft: Draft): PreviewOrder | null {
  const items = snapshot.lines.flatMap((line) => {
    const product = getProduct(line.slug);
    return product ? [{ product, qty: line.qty }] : [];
  });
  if (items.length === 0) return null;
  const totalUsd = items.reduce(
    (sum, item) => sum + item.product.priceUsd * item.qty,
    0,
  );
  const order: PreviewOrder = {
    id: `RS-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    ...draft,
    currency: snapshot.currency,
    lines: items.map((item) => ({
      slug: item.product.slug,
      name: item.product.name,
      qty: item.qty,
      unitUsd: item.product.priceUsd,
    })),
    totalUsd,
  };
  update({ orders: [order, ...snapshot.orders].slice(0, 8), lines: [] });
  return order;
}

type ShopContextValue = {
  hydrated: boolean;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  lines: CartLine[];
  items: { product: Product; qty: number }[];
  count: number;
  totalUsd: number;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  orders: PreviewOrder[];
  placeOrder: (draft: Draft) => PreviewOrder | null;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    loadFromBrowser();
  }, []);
  const items = useMemo(
    () =>
      snap.lines.flatMap((line) => {
        const product = getProduct(line.slug);
        return product ? [{ product, qty: line.qty }] : [];
      }),
    [snap],
  );
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const totalUsd = items.reduce(
    (sum, item) => sum + item.product.priceUsd * item.qty,
    0,
  );

  const value = useMemo<ShopContextValue>(
    () => ({
      hydrated: snap.ready,
      currency: snap.currency,
      setCurrency,
      lines: snap.lines,
      items,
      count,
      totalUsd,
      add,
      setQty,
      remove,
      orders: snap.orders,
      placeOrder,
    }),
    [count, items, snap, totalUsd],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }
  return context;
}
