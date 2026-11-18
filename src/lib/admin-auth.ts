import { cookies } from "next/headers";
import { sessionIsValid } from "@/lib/store";

export const adminCookie = "rs_admin";

export async function readAdminSession() {
  const jar = await cookies();
  const token = jar.get(adminCookie)?.value;
  return sessionIsValid(token);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}
