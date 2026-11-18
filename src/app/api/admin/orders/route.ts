import { connection, NextResponse } from "next/server";
import { readAdminSession } from "@/lib/admin-auth";
import { listOrders } from "@/lib/store";

export async function GET() {
  await connection();
  if (!(await readAdminSession())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  return NextResponse.json({ orders: await listOrders() });
}
