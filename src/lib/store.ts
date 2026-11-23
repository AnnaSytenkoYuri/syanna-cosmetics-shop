import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import path from "path";
import { defaultStock, type Listing } from "@/lib/catalog";
import type { PublicCustomer } from "@/lib/customer";
import { isOrderStatus, type OrderEvent, type OrderStatus } from "@/lib/order-status";
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
  customerId: string | null;
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
  status: OrderStatus;
  trackingNumber: string;
  events: OrderEvent[];
};

type Customer = PublicCustomer & {
  passwordHash: string;
  cart: { slug: string; qty: number }[];
};

type Session = { id: string; expires: number };

type CustomerSession = { id: string; customerId: string; expires: number };

type Store = {
  products: Record<string, Listing>;
  orders: SavedOrder[];
  sessions: Session[];
  customers: Customer[];
  customerSessions: CustomerSession[];
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
  return { products: listings, orders: [], sessions: [], customers: [], customerSessions: [] };
}

function normalizeOrder(order: Partial<SavedOrder>): SavedOrder | null {
  if (!order || typeof order.id !== "string" || !Array.isArray(order.lines)) return null;
  const createdAt = typeof order.createdAt === "string" ? order.createdAt : new Date().toISOString();
  const events = Array.isArray(order.events)
    ? order.events.flatMap((event) => {
        if (!event || !isOrderStatus(event.status) || typeof event.at !== "string") return [];
        return [{ status: event.status, at: event.at, note: typeof event.note === "string" ? event.note : "" }];
      })
    : [];
  const fallback = isOrderStatus(order.status) ? order.status : "placed";
  const history = events.length > 0 ? events : [{ status: fallback, at: createdAt, note: "" }];
  return {
    id: order.id,
    createdAt,
    customerId: typeof order.customerId === "string" ? order.customerId : null,
    name: typeof order.name === "string" ? order.name : "",
    email: typeof order.email === "string" ? order.email : "",
    country: typeof order.country === "string" ? order.country : "",
    city: typeof order.city === "string" ? order.city : "",
    address: typeof order.address === "string" ? order.address : "",
    note: typeof order.note === "string" ? order.note : "",
    currency: order.currency === "THB" ? "THB" : "USD",
    lines: order.lines.filter(
      (line) => line && typeof line.slug === "string" && typeof line.name === "string" && typeof line.qty === "number",
    ),
    subtotalUsd: typeof order.subtotalUsd === "number" ? order.subtotalUsd : 0,
    shippingUsd: typeof order.shippingUsd === "number" ? order.shippingUsd : 0,
    shippingZone: typeof order.shippingZone === "string" ? order.shippingZone : "",
    shippingDays: typeof order.shippingDays === "string" ? order.shippingDays : "",
    totalUsd: typeof order.totalUsd === "number" ? order.totalUsd : 0,
    emailStatus: order.emailStatus === "sent" || order.emailStatus === "failed" ? order.emailStatus : "saved",
    status: history[history.length - 1].status,
    trackingNumber: typeof order.trackingNumber === "string" ? order.trackingNumber : "",
    events: history,
  };
}

function read(): Store {
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as Partial<Store>;
    const base = seed();
    const customers = Array.isArray(parsed.customers)
      ? parsed.customers.flatMap((customer) => {
          if (!customer || typeof customer.id !== "string" || typeof customer.email !== "string" || typeof customer.passwordHash !== "string") {
            return [];
          }
          return [{ ...customer, cart: sanitizeCart(customer.cart) }];
        })
      : [];
    return {
      products: { ...base.products, ...parsed.products },
      orders: Array.isArray(parsed.orders) ? parsed.orders.flatMap((order) => {
        const next = normalizeOrder(order);
        return next ? [next] : [];
      }) : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      customers,
      customerSessions: Array.isArray(parsed.customerSessions) ? parsed.customerSessions : [],
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

function sanitizeCart(value: unknown) {
  if (!Array.isArray(value)) return [];
  const lines: { slug: string; qty: number }[] = [];
  for (const line of value) {
    if (!line || typeof line !== "object") continue;
    const slug = "slug" in line && typeof line.slug === "string" ? line.slug : "";
    const qty = "qty" in line && typeof line.qty === "number" ? Math.floor(line.qty) : 0;
    if (!products.some((product) => product.slug === slug) || qty < 1) continue;
    const capped = Math.min(6, qty);
    const existing = lines.find((item) => item.slug === slug);
    if (existing) existing.qty = Math.min(6, existing.qty + capped);
    else lines.push({ slug, qty: capped });
    if (lines.length >= 10) break;
  }
  return lines;
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
  customerId: string | null;
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
    customerId: draft.customerId && store.customers.some((customer) => customer.id === draft.customerId) ? draft.customerId : null,
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
    status: "placed",
    trackingNumber: "",
    events: [{ status: "placed", at: new Date().toISOString(), note: "" }],
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

export function readCustomerCart(customerId: string) {
  return locked(() => read().customers.find((customer) => customer.id === customerId)?.cart ?? []);
}

export function writeCustomerCart(customerId: string, lines: unknown) {
  return locked(() => {
    const store = read();
    const customer = store.customers.find((item) => item.id === customerId);
    if (!customer) return { error: "Sign in required." };
    customer.cart = sanitizeCart(lines);
    write(store);
    return { lines: customer.cart };
  });
}

function publicCustomer(customer: Customer): PublicCustomer {
  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    phone: customer.phone,
    country: customer.country,
    city: customer.city,
    address: customer.address,
    createdAt: customer.createdAt,
  };
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  try {
    const [scheme, salt, hash] = stored.split(":");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    const actual = scryptSync(password, salt, 32);
    const expected = Buffer.from(hash, "hex");
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

const dummyPassword = hashPassword("not-a-real-password");

function issueCustomerSession(store: Store, customerId: string) {
  const now = Date.now();
  store.customerSessions = store.customerSessions.filter((session) => session.expires > now);
  const id = randomBytes(24).toString("hex");
  store.customerSessions.push({ id, customerId, expires: now + sessionDays * 24 * 60 * 60 * 1000 });
  return id;
}

export function registerCustomer(input: { name: string; email: string; password: string }) {
  return locked(() => {
    const email = input.email.toLowerCase();
    if (input.name.trim().length < 2) return { error: "Add the name for the account." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Add an email that looks complete." };
    if (input.password.length < 8 || input.password.length > 72) {
      return { error: "Use a password of 8 to 72 characters." };
    }
    const store = read();
    if (store.customers.some((customer) => customer.email === email)) {
      return { error: "An account with this email already exists. Sign in instead." };
    }
    const customer: Customer = {
      id: `c_${randomBytes(6).toString("hex")}`,
      email,
      name: input.name.trim(),
      phone: "",
      country: "",
      city: "",
      address: "",
      passwordHash: hashPassword(input.password),
      cart: [],
      createdAt: new Date().toISOString(),
    };
    store.customers.push(customer);
    const sessionId = issueCustomerSession(store, customer.id);
    write(store);
    return { customer: publicCustomer(customer), sessionId };
  });
}

export function loginCustomer(input: { email: string; password: string }) {
  return locked(() => {
    const store = read();
    const customer = store.customers.find((item) => item.email === input.email.toLowerCase());
    const matches = verifyPassword(input.password, customer?.passwordHash ?? dummyPassword);
    if (!customer || !matches) return { error: "That email or password does not match." };
    const sessionId = issueCustomerSession(store, customer.id);
    write(store);
    return { customer: publicCustomer(customer), sessionId };
  });
}

export function closeCustomerSession(id: string | undefined) {
  if (!id) return Promise.resolve();
  return locked(() => {
    const store = read();
    store.customerSessions = store.customerSessions.filter((session) => session.id !== id);
    write(store);
  });
}

export function customerFromSession(id: string | undefined) {
  if (!id) return Promise.resolve(null);
  return locked(() => {
    const store = read();
    const now = Date.now();
    const session = store.customerSessions.find((item) => item.id === id && item.expires > now);
    const customer = session ? store.customers.find((item) => item.id === session.customerId) : undefined;
    return customer ? publicCustomer(customer) : null;
  });
}

export function updateCustomerProfile(
  customerId: string,
  input: { name: string; phone: string; country: string; city: string; address: string },
) {
  return locked(() => {
    const store = read();
    const customer = store.customers.find((item) => item.id === customerId);
    if (!customer) return { error: "Sign in required." };
    if (input.name.trim().length < 2) return { error: "Add the name for the account." };
    customer.name = input.name.trim();
    customer.phone = input.phone.trim();
    customer.country = input.country;
    customer.city = input.city.trim();
    customer.address = input.address.trim();
    write(store);
    return { customer: publicCustomer(customer) };
  });
}

export function changeCustomerPassword(customerId: string, currentPassword: string, nextPassword: string) {
  return locked(() => {
    const store = read();
    const customer = store.customers.find((item) => item.id === customerId);
    if (!customer || !verifyPassword(currentPassword, customer.passwordHash)) {
      return { error: "The current password does not match." };
    }
    if (nextPassword.length < 8 || nextPassword.length > 72) {
      return { error: "Use a password of 8 to 72 characters." };
    }
    customer.passwordHash = hashPassword(nextPassword);
    write(store);
    return { ok: true as const };
  });
}

export function ordersForCustomer(customerId: string) {
  return locked(() => read().orders.filter((order) => order.customerId === customerId));
}

export function orderForCustomer(customerId: string, orderId: string) {
  return locked(() => {
    const order = read().orders.find((item) => item.customerId === customerId && item.id === orderId);
    return order ?? null;
  });
}

export function orderForEmail(orderId: string, email: string) {
  return locked(() => {
    const needle = email.toLowerCase();
    const order = read().orders.find((item) => item.id.toLowerCase() === orderId.toLowerCase() && item.email.toLowerCase() === needle);
    return order ?? null;
  });
}

export function updateOrderProgress(input: { id: string; status: OrderStatus; trackingNumber: string; note: string }) {
  return locked(() => {
    if (!isOrderStatus(input.status)) return { error: "Choose a status from the list." };
    if (input.trackingNumber && !/^[A-Za-z0-9][A-Za-z0-9 -]{0,39}$/.test(input.trackingNumber)) {
      return { error: "Tracking number can use letters, numbers, spaces, and dashes." };
    }
    const store = read();
    const order = store.orders.find((item) => item.id === input.id);
    if (!order) return { error: "That order is not in the desk." };
    order.status = input.status;
    order.trackingNumber = input.trackingNumber;
    order.events.push({
      status: input.status,
      at: new Date().toISOString(),
      note: input.note.trim().slice(0, 160),
    });
    write(store);
    return { order };
  });
}

export type { PublicCustomer };

export function listCustomers() {
  return locked(() => {
    const store = read();
    return store.customers
      .map((customer) => ({
        ...publicCustomer(customer),
        orderCount: store.orders.filter((order) => order.customerId === customer.id).length,
      }))
      .reverse();
  });
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
