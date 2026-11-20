import { connection, NextResponse } from "next/server";
import { readCustomer } from "@/lib/customer-auth";
import { changeCustomerPassword } from "@/lib/store";

export async function POST(request: Request) {
  await connection();
  const customer = await readCustomer();
  if (!customer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  let body: { currentPassword?: unknown; nextPassword?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }
  const result = await changeCustomerPassword(
    customer.id,
    typeof body.currentPassword === "string" ? body.currentPassword : "",
    typeof body.nextPassword === "string" ? body.nextPassword : "",
  );
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
