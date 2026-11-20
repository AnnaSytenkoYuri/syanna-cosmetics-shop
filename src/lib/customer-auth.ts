import { cookies } from "next/headers";
import { customerFromSession } from "@/lib/store";

export const customerCookie = "rs_customer";

export async function readCustomer() {
  const jar = await cookies();
  return customerFromSession(jar.get(customerCookie)?.value);
}

export function customerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}
