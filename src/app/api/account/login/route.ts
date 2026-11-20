import { cookies } from "next/headers";
import { connection, NextResponse } from "next/server";
import { customerCookie, customerCookieOptions } from "@/lib/customer-auth";
import { loginCustomer } from "@/lib/store";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  await connection();
  let body: { email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }
  const result = await loginCustomer({
    email: clean(body.email, 120),
    password: typeof body.password === "string" ? body.password : "",
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  const jar = await cookies();
  jar.set(customerCookie, result.sessionId, customerCookieOptions());
  return NextResponse.json({ customer: result.customer });
}
