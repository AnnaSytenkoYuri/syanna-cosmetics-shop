import { connection, NextResponse } from "next/server";
import { readCustomer } from "@/lib/customer-auth";
import { shippingCountries } from "@/lib/shipping";
import { updateCustomerProfile } from "@/lib/store";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function PATCH(request: Request) {
  await connection();
  const customer = await readCustomer();
  if (!customer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  let body: { name?: unknown; phone?: unknown; country?: unknown; city?: unknown; address?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "The profile could not be read." }, { status: 400 });
  }
  const country = clean(body.country, 40);
  if (country && !shippingCountries.includes(country)) {
    return NextResponse.json({ error: "Choose a country from the list." }, { status: 400 });
  }
  const phone = clean(body.phone, 30);
  if (phone && !/^[0-9+()\-.\s]{6,30}$/.test(phone)) {
    return NextResponse.json({ error: "Add a phone number with digits, or leave it empty." }, { status: 400 });
  }
  const result = await updateCustomerProfile(customer.id, {
    name: clean(body.name, 80),
    phone,
    country,
    city: clean(body.city, 80),
    address: clean(body.address, 200),
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
