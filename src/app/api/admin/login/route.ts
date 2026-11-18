import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookie, adminCookieOptions } from "@/lib/admin-auth";
import { expectedAdminPassword, openSession, passwordsMatch } from "@/lib/store";

export async function POST(request: Request) {
  const expected = expectedAdminPassword();
  if (!expected) {
    return NextResponse.json({ error: "Admin is not configured." }, { status: 503 });
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    password = "";
  }

  if (!passwordsMatch(password, expected.password)) {
    return NextResponse.json({ error: "That password does not match." }, { status: 401 });
  }

  const id = await openSession();
  const jar = await cookies();
  jar.set(adminCookie, id, adminCookieOptions());
  return NextResponse.json({ ok: true });
}
