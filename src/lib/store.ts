import { randomBytes, timingSafeEqual } from "crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import path from "path";
import { defaultStock, type Listing } from "@/lib/catalog";
import { products } from "@/lib/products";
import { quoteShipping } from "@/lib/shipping";

export type EmailStatus = "saved" | "sent" | "failed";

export type SavedLine = {
  slug: string;
  name: string;
  qty: number;
  unitUsd: number;
};

export type SavedOrder = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  country: string;
  city: string;
  address: string;
  note: string;
  currency: "USD" | "THB";
  lines: SavedLine[];
  subtotalUsd: number;
  shippingUsd: number;
  shippingZone: string;
  shippingDays: string;
  totalUsd: number;
  emailStatus: EmailStatus;
};

type Session = { id: string; expires: number };

type Store = {
  products: Record<string, Listing>;
  orders: SavedOrder[];
  sessions: Session[];
};

const filePath = path.join(process.cwd(), "data", "store.json");
const sessionDays = 14;

let tail: Promise<unknown> = Promise.resolve();

function seed(): Store {
  const listings: Record<string, Listing> = {};
  for (const product of products) {
    listings[product.slug] = {
      priceUsd: product.priceUsd,
      stock: defaultStock(product.slug),
      imageUrl: "",
    };
  }
  return { products: listings, orders: [], sessions: [] };
}

function read(): Store {
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as Store;
    const base = seed();
    return {
      products: { ...base.products, ...parsed.products },
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch {
    return seed();
  }
}

function write(store: Store) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.tmp`;
  writeFileSync(temp, JSON.stringify(store, null, 2));
  renameSync(temp, filePath);
}

function locked<T>(fn: () => T): Promise<T> {
  const run = tail.then(fn, fn);
  tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function listListings() {
  return locked(() => read().products);
}

export function expectedAdminPassword(): { password: string; devFallback: boolean } | null {
  const configured = process.env.ADMIN_PASSWORD;
  if (configured) return { password: configured, devFallback: false };
  if (process.env.NODE_ENV !== "production") return { password: "demo", devFallback: true };
  return null;
}

export function passwordsMatch(input: string, expected: string) {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function openSession() {
  return locked(() => {
    const store = read();
    const now = Date.now();
    store.sessions = store.sessions.filter((session) => session.expires > now);
    const id = randomBytes(24).toString("hex");
    store.sessions.push({ id, expires: now + sessionDays * 24 * 60 * 60 * 1000 });
    write(store);
    return id;
  });
}

export function closeSession(id: string) {
  return locked(() => {
    const store = read();
    store.sessions = store.sessions.filter((session) => session.id !== id);
    write(store);
  });
}

export function sessionIsValid(id: string | undefined) {
  if (!id) return false;
  return locked(() => {
    const store = read();
    const now = Date.now();
    return store.sessions.some((session) => session.id === id && session.expires > now);
  });
}

export function updateListing(input: { slug: string; priceUsd: number; stock: number; imageUrl: string }) {
  return locked(() => {
    const product = products.find((item) => item.slug === input.slug);
    if (!product) return { error: "Unknown product." };
    if (!Number.isFinite(input.priceUsd) || input.priceUsd < 0 || input.priceUsd > 500) {
      return { error: "Price needs to be between 0 and 500." };
    }
    if (!Number.isInteger(input.stock) || input.stock < 0 || input.stock > 999) {
      return { error: "Stock needs to be a whole number from 0 to 999." };
    }
    if (input.imageUrl && !/^https:\/\/\S+$/.test(input.imageUrl)) {
      return { error: "Photo needs to be an https link, or left empty." };
    }
    const store = read();
    store.products[input.slug] = {
      priceUsd: Math.round(input.priceUsd * 100) / 100,
      stock: input.stock,
      imageUrl: input.imageUrl,
    };
    write(store);
    return { listing: store.products[input.slug] };
  });
}

export type OrderDraft = {
  name: string;
  email: string;
  country: string;
  city: string;
  address: string;
  note: string;
  currency: "USD" | "THB";
  lines: { slug: string; qty: number }[];
};

export function placeOrder(draft: OrderDraft): Promise<{ order: SavedOrder } | { error: string }> {
  return locked(() => placeOrderNow(draft));
}

function placeOrderNow(draft: OrderDraft): { order: SavedOrder } | { error: string } {
  const quote = quoteShipping(draft.country);
  if (!quote) return { error: "Choose a country from the list." };
  if (draft.lines.length === 0) return { error: "The bag is empty." };

  const store = read();
  const resolved: SavedLine[] = [];
  for (const line of draft.lines) {
    const product = products.find((item) => item.slug === line.slug);
    const listing = product ? store.products[line.slug] : undefined;
    if (!product || !listing) return { error: "A product in the bag is no longer in the shop." };
    const qty = Math.floor(line.qty);
    if (qty < 1 || qty > 6) return { error: "Quantity needs to be from 1 to 6." };
    if (listing.stock < qty) {
      return { error: `${product.name} has ${listing.stock} left.` };
    }
    resolved.push({ slug: product.slug, name: product.name, qty, unitUsd: listing.priceUsd });
  }

  for (const line of resolved) {
    store.products[line.slug].stock -= line.qty;
  }

  const subtotalUsd = resolved.reduce((sum, line) => sum + line.unitUsd * line.qty, 0);
  const order: SavedOrder = {
    id: `RS-${randomBytes(3).toString("hex").toUpperCase()}`,
    createdAt: new Date().toISOString(),
    name: draft.name,
    email: draft.email,
    country: draft.country,
    city: draft.city,
    address: draft.address,
    note: draft.note,
    currency: draft.currency,
    lines: resolved,
    subtotalUsd,
    shippingUsd: quote.usd,
    shippingZone: quote.zone,
    shippingDays: quote.days,
    totalUsd: subtotalUsd + quote.usd,
    emailStatus: "saved",
  };
  store.orders.unshift(order);
  store.orders = store.orders.slice(0, 100);
  write(store);
  return { order };
}

export function setEmailStatus(id: string, emailStatus: EmailStatus) {
  return locked(() => {
    const store = read();
    const order = store.orders.find((item) => item.id === id);
    if (!order) return;
    order.emailStatus = emailStatus;
    write(store);
  });
}

export function listOrders() {
  return locked(() => read().orders);
}

export async function notifyShop(order: SavedOrder): Promise<EmailStatus> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_TO_EMAIL;
  const from = process.env.ORDER_FROM_EMAIL;
  if (!key || !to || !from) return "saved";

  const lines = order.lines
    .map((line) => `${line.name} × ${line.qty} — $${line.unitUsd.toFixed(2)}`)
    .join("\n");
  const text = [
    `Order ${order.id}`,
    `${order.name} <${order.email}>`,
    `${order.address}, ${order.city}, ${order.country}`,
    order.note ? `Note: ${order.note}` : "",
    "",
    lines,
    `Shipping (${order.shippingZone}, ${order.shippingDays}): $${order.shippingUsd.toFixed(2)}`,
    `Total: $${order.totalUsd.toFixed(2)}`,
    "",
    "Demo checkout. No card was charged.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: order.email,
        subject: `Room & Sun demo order ${order.id}`,
        text,
      }),
    });
    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
