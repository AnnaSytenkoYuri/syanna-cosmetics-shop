import { connection, NextResponse } from "next/server";
import { readCustomer } from "@/lib/customer-auth";

export async function GET() {
  await connection();
  return NextResponse.json({ customer: await readCustomer() });
}
