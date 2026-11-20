import { connection, NextResponse } from "next/server";
import { readAdminSession } from "@/lib/admin-auth";
import { isOrderStatus } from "@/lib/order-status";
import { listOrders, updateOrderProgress } from "@/lib/store";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET() {
  await connection();
  if (!(await readAdminSession())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  return NextResponse.json({ orders: await listOrders() });
}

export async function PATCH(request: Request) {
  await connection();
  if (!(await readAdminSession())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  let body: { id?: unknown; status?: unknown; trackingNumber?: unknown; note?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "The update could not be read." }, { status: 400 });
  }
  if (!isOrderStatus(body.status)) {
    return NextResponse.json({ error: "Choose a status from the list." }, { status: 400 });
  }
  const result = await updateOrderProgress({
    id: clean(body.id, 20),
    status: body.status,
    trackingNumber: clean(body.trackingNumber, 40),
    note: clean(body.note, 160),
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
