import { connection, NextResponse } from "next/server";
import { readAdminSession } from "@/lib/admin-auth";
import { products } from "@/lib/products";
import { listListings, updateListing } from "@/lib/store";

export async function GET() {
  await connection();
  if (!(await readAdminSession())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const listings = await listListings();
  return NextResponse.json({
    products: products.map((product) => ({
      slug: product.slug,
      name: product.name,
      kind: product.kind,
      ...listings[product.slug],
    })),
  });
}

export async function PATCH(request: Request) {
  if (!(await readAdminSession())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  let body: { slug?: unknown; priceUsd?: unknown; stock?: unknown; imageUrl?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "The change could not be read." }, { status: 400 });
  }
  const result = await updateListing({
    slug: typeof body.slug === "string" ? body.slug : "",
    priceUsd: typeof body.priceUsd === "number" ? body.priceUsd : Number.NaN,
    stock: typeof body.stock === "number" ? body.stock : Number.NaN,
    imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : "",
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
