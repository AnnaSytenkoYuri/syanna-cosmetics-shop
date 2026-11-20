import { connection, NextResponse } from "next/server";
import { readAdminSession } from "@/lib/admin-auth";
import { listCustomers } from "@/lib/store";

export async function GET() {
  await connection();
  if (!(await readAdminSession())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  return NextResponse.json({ customers: await listCustomers() });
}
