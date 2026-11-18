"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { createContext, useContext } from "react";
import { defaultStock, type Listing } from "@/lib/catalog";
import { getProduct, type Product } from "@/lib/products";
import type { Currency } from "@/lib/money";

const CART_KEY = "room-and-sun-cart";
const CURRENCY_KEY = "room-and-sun-currency";
const MAX_QTY = 6;

type Catalog = Record<string, Listing>;

export type CartLine = { slug: string; qty: number };

type Snapshot = {
  currency: Currency;
  lines: CartLine[];
  catalog: Catalog;
  ready: boolean;
};

const initialSnapshot: Snapshot = {
  currency: "USD",
  lines: [],
  catalog: {},
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

function persist(next: Snapshot) {
  localStorage.setItem(CART_KEY, JSON.stringify(next.lines));
  localStorage.setItem(CURRENCY_KEY, JSON.stringify(next.currency));
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
    catalog: {},
    ready: true,
  });
}

async function refreshCatalog() {
  try {
    const response = await fetch("/api/catalog");
    if (!response.ok) return;
    const data = (await response.json()) as { products: Catalog };
    commit({ ...snapshot, catalog: data.products });
  } catch {
    // Sample prices stay in place when the catalog cannot be read.
  }
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

function update(partial: Partial<Pick<Snapshot, "currency" | "lines">>) {
  commit({
    currency: partial.currency ?? snapshot.currency,
    lines: partial.lines ?? snapshot.lines,
    catalog: snapshot.catalog,
    ready: true,
  });
}

function limitFor(slug: string) {
  const stock = snapshot.catalog[slug]?.stock ?? defaultStock(slug);
  return Math.min(MAX_QTY, Math.max(0, stock));
}

function add(slug: string, qty = 1) {
  if (!getProduct(slug) || qty < 1) return;
  const limit = limitFor(slug);
  if (limit < 1) return;
  const existing = snapshot.lines.find((line) => line.slug === slug);
  if (existing && existing.qty >= limit) return;
  const lines = existing
    ? snapshot.lines.map((line) =>
        line.slug === slug ? { ...line, qty: Math.min(limit, line.qty + qty) } : line,
      )
    : [...snapshot.lines, { slug, qty: Math.min(limit, qty) }];
  update({ lines });
}

function setQty(slug: string, qty: number) {
  const limit = limitFor(slug);
  update({
    lines: snapshot.lines.flatMap((line) => {
      if (line.slug !== slug) return [line];
      if (qty <= 0 || limit < 1) return [];
      return [{ ...line, qty: Math.min(limit, Math.floor(qty)) }];
    }),
  });
}

function clear() {
  update({ lines: [] });
}

function remove(slug: string) {
  update({ lines: snapshot.lines.filter((line) => line.slug !== slug) });
}

function setCurrency(currency: Currency) {
  update({ currency });
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
  clear: () => void;
  stockFor: (slug: string) => number;
  imageFor: (slug: string) => string;
  priceFor: (slug: string, fallback: number) => number;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    loadFromBrowser();
    void refreshCatalog();
    function refresh() {
      void refreshCatalog();
    }
    window.addEventListener("focus", refresh);
    window.addEventListener("rs-catalog", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("rs-catalog", refresh);
    };
  }, []);
  const items = useMemo(
    () =>
      snap.lines.flatMap((line) => {
        const product = getProduct(line.slug);
        if (!product) return [];
        const priceUsd = snap.catalog[line.slug]?.priceUsd ?? product.priceUsd;
        return [{ product: { ...product, priceUsd }, qty: line.qty }];
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
      clear,
      stockFor: (slug: string) => snap.catalog[slug]?.stock ?? defaultStock(slug),
      imageFor: (slug: string) => snap.catalog[slug]?.imageUrl ?? "",
      priceFor: (slug: string, fallback: number) => snap.catalog[slug]?.priceUsd ?? fallback,
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
