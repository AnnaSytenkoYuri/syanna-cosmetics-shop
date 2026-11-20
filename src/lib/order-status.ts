export const orderStatuses = ["placed", "packing", "shipped", "delivered", "cancelled"] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type OrderEvent = {
  status: OrderStatus;
  at: string;
  note: string;
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  placed: "Placed",
  packing: "Packing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const trackingSteps: OrderStatus[] = ["placed", "packing", "shipped", "delivered"];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (orderStatuses as readonly string[]).includes(value);
}
