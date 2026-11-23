"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { announceAccount } from "@/components/account-session";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/track", label: "Track a parcel" },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
      {links.map((link) => {
        const current = link.href === "/account" ? pathname === "/account" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "border px-3 py-2 text-sm whitespace-nowrap",
              current ? "border-primary bg-primary text-primary-foreground" : "border-border",
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <button
        type="button"
        className="border border-border px-3 py-2 text-left text-sm"
        onClick={() => {
          void fetch("/api/account/logout", { method: "POST" }).finally(() => {
            announceAccount();
            router.replace("/account/login");
          });
        }}
      >
        Sign out
      </button>
    </nav>
  );
}
