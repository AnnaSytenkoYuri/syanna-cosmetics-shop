import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-serif text-2xl">Room & Sun</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Skincare for hot air outside and dry air inside. A brand preview,
            written from Bangkok.
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
                The idea
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:underline">
                Bag
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:underline">
                Shop desk
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm leading-6 text-muted-foreground">
          <p>
            Sample prices. Sample formulas. No warehouse, no card charge, no
            medical claims.
          </p>
          <p className="mt-3">
            Cosmetic care only. Not a drug, not sunscreen, not a treatment.
          </p>
        </div>
      </div>
    </footer>
  );
}
