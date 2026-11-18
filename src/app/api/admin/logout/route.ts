import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin-auth";
import { closeSession } from "@/lib/store";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(adminCookie)?.value;
  if (token) await closeSession(token);
  jar.delete(adminCookie);
  return NextResponse.json({ ok: true });
}
