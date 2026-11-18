export type ShippingQuote = {
  country: string;
  zone: string;
  usd: number;
  days: string;
};

const zones: { zone: string; usd: number; days: string; countries: string[] }[] = [
  { zone: "Thailand", usd: 4, days: "2–5 days", countries: ["Thailand"] },
  {
    zone: "Asia",
    usd: 9,
    days: "5–9 days",
    countries: ["Singapore", "Malaysia", "Japan", "South Korea"],
  },
  {
    zone: "Europe",
    usd: 14,
    days: "7–14 days",
    countries: ["Germany", "France", "Netherlands", "Poland", "United Kingdom", "Ukraine"],
  },
  {
    zone: "United States and Australia",
    usd: 16,
    days: "8–16 days",
    countries: ["United States", "Australia"],
  },
];

export const shippingCountries = [
  "Thailand",
  "Ukraine",
  "Singapore",
  "Malaysia",
  "Japan",
  "South Korea",
  "Germany",
  "France",
  "Netherlands",
  "Poland",
  "United Kingdom",
  "United States",
  "Australia",
  "Somewhere else",
];

export function quoteShipping(country: string): ShippingQuote | null {
  if (!shippingCountries.includes(country)) return null;
  const match = zones.find((zone) => zone.countries.includes(country));
  if (!match) {
    return { country, zone: "Other countries", usd: 18, days: "10–20 days" };
  }
  return { country, zone: match.zone, usd: match.usd, days: match.days };
}

export const shippingNote =
  "Sample shipping for the demo. A live shop would use the carrier's price and the country's import rules.";
