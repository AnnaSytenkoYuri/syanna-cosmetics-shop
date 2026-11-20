import { cookies } from "next/headers";
import { connection, NextResponse } from "next/server";
import { customerCookie } from "@/lib/customer-auth";
import { closeCustomerSession } from "@/lib/store";

export async function POST() {
  await connection();
  const jar = await cookies();
  await closeCustomerSession(jar.get(customerCookie)?.value);
  jar.delete(customerCookie);
  return NextResponse.json({ ok: true });
}
