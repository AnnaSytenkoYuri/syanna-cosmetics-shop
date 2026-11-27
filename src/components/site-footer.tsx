import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-serif text-2xl">Syanna Cosmetics</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            An international skincare brand. Climate Care is the first collection,
            for hot humid air outside and dry air-conditioned rooms. Nothing is for sale yet.
          </p>
        </div>
        <div className="text-sm">
          <p className="tracking-[0.16em] text-muted-foreground uppercase">Visit</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/shop" className="hover:underline">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/routine" className="hover:underline">
                Routine
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:underline">
                Bag
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:underline">
                Account
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:underline">
                Track a parcel
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm leading-6 text-muted-foreground">
          <p>
            Sample formulas. Nothing is for sale yet. No medical claims.
          </p>
          <p className="mt-3">
            Cosmetic care only. Not a drug, not sunscreen, not a treatment.
          </p>
        </div>
      </div>
    </footer>
  );
}
