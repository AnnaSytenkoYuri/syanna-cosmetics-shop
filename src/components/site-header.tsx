"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Menu } from "lucide-react";
import { useAccount } from "@/components/account-session";
import { useShop } from "@/components/shop-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function subscribeToNothing() {
  return () => {};
}

function useAfterHydration() {
  return useSyncExternalStore(subscribeToNothing, () => true, () => false);
}

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/routine", label: "Routine" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { count, currency, setCurrency } = useShop();
  const { customer, ready } = useAccount();
  const live = useAfterHydration();
  const shownCount = live ? count : 0;
  const shownCurrency = live ? currency : "USD";
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <p className="border-b border-border px-5 py-2 text-center text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        A preview of Climate Care. Nothing is for sale yet.
      </p>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5 md:px-8">
        <Link href="/" className="font-serif text-[1.35rem] leading-none tracking-tight">
          Syanna
        </Link>
        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm",
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden border border-border sm:flex" role="group" aria-label="Currency">
            {(["USD", "THB"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={shownCurrency === option}
                onClick={() => setCurrency(option)}
                className={cn(
                  "px-2.5 py-1.5 text-xs tracking-wide",
                  shownCurrency === option ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <Link href={live && ready && customer ? "/account" : "/account/login"} className="px-2 text-sm">
            {live && ready && customer ? customer.name.split(" ")[0] : "Account"}
          </Link>
          <Link
            href="/cart"
            className="px-2 text-sm"
            aria-label={`Bag, ${shownCount} ${shownCount === 1 ? "item" : "items"}`}
          >
            Bag
            <span className="ml-1 tabular-nums">{shownCount}</span>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl">Syanna</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="border-b border-border py-4 text-lg"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/cart" className="border-b border-border py-4 text-lg" onClick={() => setOpen(false)}>
                  Bag ({shownCount})
                </Link>
                <Link
                  href={live && ready && customer ? "/account" : "/account/login"}
                  className="border-b border-border py-4 text-lg"
                  onClick={() => setOpen(false)}
                >
                  {live && ready && customer ? "Your account" : "Sign in"}
                </Link>
                <Link href="/track" className="border-b border-border py-4 text-lg" onClick={() => setOpen(false)}>
                  Track
                </Link>
              </nav>
              <div className="mt-6 flex px-4" role="group" aria-label="Currency">
                {(["USD", "THB"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={shownCurrency === option}
                    onClick={() => setCurrency(option)}
                    className={cn(
                      "h-11 flex-1 border border-border text-sm",
                      shownCurrency === option && "bg-primary text-primary-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

export function HeaderFallback() {
  return <div className="h-[104px] border-b border-border bg-background" />;
}
