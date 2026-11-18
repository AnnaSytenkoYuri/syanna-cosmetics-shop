export const THB_PER_USD = 34.5;

export type Currency = "USD" | "THB";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const thb = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export function formatMoney(amountUsd: number, currency: Currency) {
  if (currency === "THB") {
    return thb.format(Math.round(amountUsd * THB_PER_USD));
  }
  return usd.format(amountUsd);
}

export const rateNote = `Baht prices use a fixed guide of ฿${THB_PER_USD.toFixed(2)} per dollar, not a live rate.`;
