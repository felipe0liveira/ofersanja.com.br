import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";
import { adminDb } from "@/lib/firebase-admin";
import { scrapeMlProduct } from "@/lib/scraper/ml-product";

export async function POST(request: NextRequest) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  let url: string;
  try {
    const body = await request.json();
    url = body?.url;
    if (typeof url !== "string" || !url) throw new Error("Missing url");
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const isMl = url.includes("mercadolivre.com.br") || url.includes("meli.la") || url.includes("mercadolivre.page.link");
  if (!isMl) {
    return Response.json(
      { error: "URL must be from mercadolivre.com.br or meli.la" },
      { status: 400 }
    );
  }

  let product;
  try {
    product = await scrapeMlProduct(url);
  } catch (err) {
    console.error("scrapeMlProduct failed:", err);
    return Response.json({ error: "Failed to scrape product" }, { status: 502 });
  }

  // Derive slug from the resolved product URL (handles short URLs like meli.la/…)
  let slug: string;
  try {
    const parsed = new URL(product.product_link);
    slug = parsed.pathname.split("/").filter(Boolean)[0];
    if (!slug) throw new Error("Empty slug");
  } catch {
    return Response.json({ error: "Could not extract slug from product URL" }, { status: 502 });
  }

  const docData = {
    trigger: "manual" as const,
    name: product.name,
    image: product.image,
    link: product.product_link,
    price: product.price,
    old_price: product.old_price,
    coupon: product.coupon,
    coupon_description: product.coupon_description,
    coupon_price: 0,
    price_with_coupon: product.price_with_coupon,
    seller: product.seller,
    rating: product.rating,
    time_limited: false,
    expiration_datetime: null,
    scrapped_at: product.scrapped_at,
    dispatched_at: null,
  };

  await adminDb.collection("offers").doc(slug).set(docData, { merge: true });

  return Response.json({
    success: true,
    slug,
    offer: { id: slug, ...docData, scrapped_at: product.scrapped_at.toISOString() },
  });
}
