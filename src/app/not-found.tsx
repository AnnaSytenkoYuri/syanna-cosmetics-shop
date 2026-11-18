import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-24 md:px-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">404</p>
      <h1 className="mt-3 font-serif text-5xl leading-none">This page is not in the shop.</h1>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        The product may have been a mistyped link. The line itself is short and
        listed in the shop.
      </p>
      <Button className="mt-8 h-12 px-5" nativeButton={false}
        render={<Link href="/shop" />}>
        Back to the shop
      </Button>
    </div>
  );
}
