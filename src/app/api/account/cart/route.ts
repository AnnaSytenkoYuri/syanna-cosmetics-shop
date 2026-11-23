import { connection, NextResponse } from "next/server";
import { readCustomer } from "@/lib/customer-auth";
import { readCustomerCart, writeCustomerCart } from "@/lib/store";

export async function GET() {
  await connection();
  const customer = await readCustomer();
  if (!customer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.json({ lines: await readCustomerCart(customer.id) });
}

export async function PUT(request: Request) {
  await connection();
  const customer = await readCustomer();
  if (!customer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  let lines: unknown = [];
  try {
    const body = (await request.json()) as { lines?: unknown };
    lines = body.lines;
  } catch {
    return NextResponse.json({ error: "The bag could not be read." }, { status: 400 });
  }
  if (!Array.isArray(lines) || lines.length > 10) {
    return NextResponse.json({ error: "The bag could not be read." }, { status: 400 });
  }
  const result = await writeCustomerCart(customer.id, lines);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}
