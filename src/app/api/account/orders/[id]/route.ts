import { connection, NextResponse } from "next/server";
import { readCustomer } from "@/lib/customer-auth";
import { orderForCustomer } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await connection();
  const customer = await readCustomer();
  if (!customer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await context.params;
  const order = await orderForCustomer(customer.id, id);
  if (!order) return NextResponse.json({ error: "That order is not in this account." }, { status: 404 });
  return NextResponse.json({ order });
}
