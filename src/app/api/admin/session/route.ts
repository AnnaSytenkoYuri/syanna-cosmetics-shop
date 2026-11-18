import { NextResponse } from "next/server";
import { readAdminSession } from "@/lib/admin-auth";
import { expectedAdminPassword } from "@/lib/store";

export async function GET() {
  const expected = expectedAdminPassword();
  return NextResponse.json({
    signedIn: await readAdminSession(),
    configured: Boolean(expected),
    devFallback: Boolean(expected?.devFallback),
  });
}
