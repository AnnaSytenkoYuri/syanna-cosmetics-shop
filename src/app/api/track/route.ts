import { connection, NextResponse } from "next/server";
import { orderForEmail } from "@/lib/store";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  await connection();
  let body: { id?: unknown; email?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "The lookup could not be read." }, { status: 400 });
  }
  const order = await orderForEmail(clean(body.id, 20), clean(body.email, 120));
  if (!order) {
    return NextResponse.json({ error: "No order matches that number and email." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
