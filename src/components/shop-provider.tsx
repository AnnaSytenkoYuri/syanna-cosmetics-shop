"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { createContext, useContext } from "react";
import { defaultStock, type Listing } from "@/lib/catalog";
import { getProduct, purchasesOpen, type Product } from "@/lib/products";
import type { Currency } from "@/lib/money";

// Legacy browser keys are kept so bags saved before the Syanna rename still load.
const GUEST_CART_KEY = "room-and-sun-cart-guest";
const LEGACY_CART_KEY = "room-and-sun-cart";
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
let owner: "guest" | string = "guest";
const listeners = new Set<() => void>();
let adoptGeneration = 0;

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

function readGuestLines(): CartLine[] {
  localStorage.removeItem(LEGACY_CART_KEY);
  return sanitizeLines(readJson<unknown>(GUEST_CART_KEY, []));
}

function writeGuestLines(lines: CartLine[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
  localStorage.removeItem(LEGACY_CART_KEY);
}

function persist(next: Snapshot) {
  localStorage.setItem(CURRENCY_KEY, JSON.stringify(next.currency));
  if (owner === "guest") writeGuestLines(next.lines);
}

function saveAccountLines(customerId: string, lines: CartLine[]) {
  void fetch("/api/account/cart", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ lines }),
    keepalive: true,
  });
}

function mergeLines(base: CartLine[], extra: CartLine[]) {
  const lines = base.map((line) => ({ ...line }));
  for (const line of extra) {
    const existing = lines.find((item) => item.slug === line.slug);
    if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + line.qty);
    else if (lines.length < 10) lines.push({ ...line });
  }
  return lines;
}

function commit(next: Snapshot) {
  snapshot = next;
  if (typeof window !== "undefined" && next.ready) persist(next);
  listeners.forEach((listener) => listener());
}

function storedCurrency(): "USD" | "THB" {
  return readJson<unknown>(CURRENCY_KEY, snapshot.currency) === "THB" ? "THB" : "USD";
}

async function adoptAccount() {
  const generation = ++adoptGeneration;
  let customerId: string | null = null;
  try {
    const response = await fetch("/api/account/session");
    if (!response.ok) return;
    const data = (await response.json()) as { customer?: { id?: string } | null };
    customerId = data.customer?.id ?? null;
  } catch {
    if (snapshot.ready) return;
    customerId = null;
  }
  if (generation !== adoptGeneration) return;

  if (!customerId) {
    owner = "guest";
    commit({
      currency: storedCurrency(),
      lines: readGuestLines(),
      catalog: snapshot.catalog,
      ready: true,
    });
    return;
  }

  if (owner === customerId && snapshot.ready) return;

  let remote: CartLine[] = [];
  try {
    const response = await fetch("/api/account/cart");
    if (response.ok) {
      const data = (await response.json()) as { lines?: unknown };
      remote = sanitizeLines(data.lines);
    }
  } catch {
    remote = [];
  }
  if (generation !== adoptGeneration) return;

  const guestLines = owner === "guest" ? (snapshot.ready ? snapshot.lines : readGuestLines()) : [];
  const lines = guestLines.length > 0 ? mergeLines(remote, guestLines) : remote;
  owner = customerId;
  commit({
    currency: storedCurrency(),
    lines,
    catalog: snapshot.catalog,
    ready: true,
  });
  if (guestLines.length > 0) {
    writeGuestLines([]);
    saveAccountLines(customerId, lines);
  }
}

async function refreshCatalog() {
  try {
    const response = await fetch("/api/catalog");
    if (!response.ok) return;
    const data = (await response.json()) as { products?: Catalog };
    const products = data.products ?? {};
    if (JSON.stringify(products) === JSON.stringify(snapshot.catalog)) return;
    commit({ ...snapshot, catalog: products });
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
  const lines = partial.lines ?? snapshot.lines;
  commit({
    currency: partial.currency ?? snapshot.currency,
    lines,
    catalog: snapshot.catalog,
    ready: true,
  });
  if (partial.lines && owner !== "guest") saveAccountLines(owner, lines);
}

function limitFor(slug: string) {
  const stock = snapshot.catalog[slug]?.stock ?? defaultStock(slug);
  return Math.min(MAX_QTY, Math.max(0, stock));
}

function add(slug: string, qty = 1) {
  if (!purchasesOpen) return;
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
    void adoptAccount();
    void refreshCatalog();
    function refresh() {
      void refreshCatalog();
    }
    function onAccount() {
      void adoptAccount();
    }
    function onVisible() {
      if (document.visibilityState === "visible") void refreshCatalog();
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("rs-catalog", refresh);
    window.addEventListener("rs-account", onAccount);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("rs-catalog", refresh);
      window.removeEventListener("rs-account", onAccount);
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
