export type Listing = {
  priceUsd: number;
  stock: number;
  imageUrl: string;
};

export function defaultStock(slug: string) {
  return slug === "two-weather-set" ? 6 : 12;
}
