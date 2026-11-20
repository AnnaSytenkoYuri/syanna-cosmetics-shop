import { connection, NextResponse } from "next/server";
import { readCustomer } from "@/lib/customer-auth";
import { shippingCountries } from "@/lib/shipping";
import { notifyShop, placeOrder, setEmailStatus, type OrderDraft } from "@/lib/store";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  await connection();
  let body: Partial<OrderDraft> & { lines?: { slug?: string; qty?: number }[] };
  try {
    body = (await request.json()) as Partial<OrderDraft> & { lines?: { slug?: string; qty?: number }[] };
  } catch {
    return NextResponse.json({ error: "The order could not be read." }, { status: 400 });
  }

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const country = clean(body.country, 40);
  const city = clean(body.city, 80);
  const address = clean(body.address, 200);
  const note = clean(body.note, 300);
  const currency = body.currency === "THB" ? "THB" : body.currency === "USD" ? "USD" : null;

  if (name.length < 2) return NextResponse.json({ error: "Add the name for the parcel." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Add an email that looks complete." }, { status: 400 });
  }
  if (!shippingCountries.includes(country)) {
    return NextResponse.json({ error: "Choose a country from the list." }, { status: 400 });
  }
  if (city.length < 2) return NextResponse.json({ error: "Add a city." }, { status: 400 });
  if (address.length < 5) return NextResponse.json({ error: "Add a street address." }, { status: 400 });
  if (!currency) return NextResponse.json({ error: "Choose a currency." }, { status: 400 });
  if (!Array.isArray(body.lines) || body.lines.length === 0 || body.lines.length > 10) {
    return NextResponse.json({ error: "The bag is empty." }, { status: 400 });
  }

  const lines = body.lines.map((line) => ({
    slug: clean(line.slug, 80),
    qty: typeof line.qty === "number" ? line.qty : 0,
  }));

  const customer = await readCustomer();
  const placed = await placeOrder({
    name,
    email,
    country,
    city,
    address,
    note,
    currency,
    lines,
    customerId: customer?.id ?? null,
  });
  if ("error" in placed) return NextResponse.json({ error: placed.error }, { status: 409 });

  const emailStatus = await notifyShop(placed.order);
  if (emailStatus !== placed.order.emailStatus) {
    await setEmailStatus(placed.order.id, emailStatus);
  }

  return NextResponse.json({ order: { ...placed.order, emailStatus } });
}
