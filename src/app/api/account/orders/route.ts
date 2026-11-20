import { connection, NextResponse } from "next/server";
import { readCustomer } from "@/lib/customer-auth";
import { ordersForCustomer } from "@/lib/store";

export async function GET() {
  await connection();
  const customer = await readCustomer();
  if (!customer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.json({ orders: await ordersForCustomer(customer.id) });
}
