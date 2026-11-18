import { connection, NextResponse } from "next/server";
import { listListings } from "@/lib/store";

export async function GET() {
  await connection();
  const products = await listListings();
  return NextResponse.json({ products });
}
