import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";

const tones: Record<
  string,
  { ground: string; ink: string; liquid: string; cap: string }
> = {
  "day-wash": {
    ground: "#f4e2c4",
    ink: "#3a2412",
    liquid: "#f2c56b",
    cap: "#243f36",
  },
  "water-veil": {
    ground: "#e5f0ea",
    ink: "#163028",
    liquid: "#c9e4d8",
    cap: "#1d4a3c",
  },
  "shade-gel": {
    ground: "#e7f2df",
    ink: "#1d3324",
    liquid: "#b7d7b4",
    cap: "#2f5d45",
  },
  "cabin-balm": {
    ground: "#f6e4d2",
    ink: "#3a2412",
    liquid: "#e7b089",
    cap: "#c56a2d",
  },
  "two-weather-set": {
    ground: "#efe6d4",
    ink: "#243f36",
    liquid: "#e7c48a",
    cap: "#243f36",
  },
};

export function ProductMark({
  product,
  className,
  compact = false,
}: {
  product: Product;
  className?: string;
  compact?: boolean;
}) {
  const tone = tones[product.slug] ?? tones["water-veil"];

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: tone.ground, color: tone.ink }}
    >
      <svg
        viewBox="0 0 360 440"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <circle cx="290" cy="70" r="46" fill={tone.liquid} opacity="0.9" />
        <rect x="28" y="300" width="150" height="8" fill={tone.ink} opacity="0.18" />
        {product.slug === "cabin-balm" ? (
          <g>
            <ellipse cx="180" cy="250" rx="78" ry="22" fill={tone.cap} />
            <path
              d="M102 250h156v46c0 28-35 48-78 48s-78-20-78-48z"
              fill={tone.liquid}
            />
            <ellipse cx="180" cy="250" rx="78" ry="18" fill={tone.cap} opacity="0.85" />
          </g>
        ) : product.slug === "two-weather-set" ? (
          <g>
            <rect x="78" y="150" width="46" height="150" rx="16" fill={tone.liquid} />
            <rect x="86" y="128" width="30" height="28" rx="6" fill={tone.cap} />
            <rect x="150" y="168" width="54" height="132" rx="18" fill="#d5ebe3" />
            <rect x="166" y="146" width="22" height="26" rx="8" fill={tone.cap} />
            <rect x="222" y="186" width="62" height="114" rx="20" fill="#c5dcc8" />
          </g>
        ) : (
          <g>
            <rect
              x="132"
              y="132"
              width="96"
              height="28"
              rx="8"
              fill={tone.cap}
            />
            <rect
              x="158"
              y="112"
              width="44"
              height="24"
              rx="6"
              fill={tone.ink}
              opacity="0.8"
            />
            <path
              d="M118 160h124l-12 168c-2 22-20 36-50 36s-48-14-50-36z"
              fill={tone.liquid}
            />
            <path
              d="M142 196h76"
              stroke={tone.ink}
              strokeOpacity="0.25"
              strokeWidth="4"
            />
          </g>
        )}
      </svg>
      {compact ? null : (
        <>
          <div className="absolute top-5 left-5 text-[11px] tracking-[0.22em] uppercase">
            Room & Sun
          </div>
          <div className="absolute right-5 bottom-5 left-5">
            <p className="font-serif text-3xl leading-none">{product.name}</p>
            <p className="mt-2 text-sm">{product.size}</p>
          </div>
        </>
      )}
    </div>
  );
}
