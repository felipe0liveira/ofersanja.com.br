import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";
import { adminDb } from "@/lib/firebase-admin";
import { scrapeMlProduct, isShortUrl } from "@/lib/scraper/ml-product";

async function runExtraction(jobId: string, url: string) {
  const jobRef = adminDb.collection("extraction_jobs").doc(jobId);
  try {
    const product = await scrapeMlProduct(url);

    let slug: string;
    const parsed = new URL(product.product_link);
    slug = parsed.pathname.split("/").filter(Boolean)[0];
    if (!slug) throw new Error("Empty slug");

    // Check if offer already exists in the collection
    const existingDoc = await adminDb.collection("offers").doc(slug).get();
    if (existingDoc.exists) {
      const d = existingDoc.data()!;
      const toIso = (v: unknown) =>
        v && typeof (v as { toDate?: () => Date }).toDate === "function"
          ? (v as { toDate: () => Date }).toDate().toISOString()
          : (v ?? null);
      await jobRef.update({
        status: "conflict",
        slug,
        existingOffer: {
          id: slug,
          ...d,
          scrapped_at: toIso(d.scrapped_at),
          dispatched_at: toIso(d.dispatched_at),
          expiration_datetime: toIso(d.expiration_datetime),
        },
      });
      return;
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

    await jobRef.update({
      status: "done",
      slug,
      offer: { id: slug, ...docData, scrapped_at: product.scrapped_at.toISOString() },
    });
  } catch (err) {
    console.error(`[extraction:${jobId}] failed:`, err);
    await jobRef.update({
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

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

  // Early synchronous conflict check — only possible for direct ML URLs where the
  // slug is already visible in the path (short URLs need scraping first)
  if (!isShortUrl(url)) {
    try {
      const parsed = new URL(url);
      const candidateSlug = parsed.pathname.split("/").filter(Boolean)[0];
      if (candidateSlug) {
        const existingDoc = await adminDb.collection("offers").doc(candidateSlug).get();
        if (existingDoc.exists) {
          const d = existingDoc.data()!;
          const toIso = (v: unknown) =>
            v && typeof (v as { toDate?: () => Date }).toDate === "function"
              ? (v as { toDate: () => Date }).toDate().toISOString()
              : (v ?? null);
          return Response.json(
            {
              conflict: true,
              existingOffer: {
                id: candidateSlug,
                ...d,
                scrapped_at: toIso(d.scrapped_at),
                dispatched_at: toIso(d.dispatched_at),
                expiration_datetime: toIso(d.expiration_datetime),
              },
            },
            { status: 409 }
          );
        }
      }
    } catch {
      // Malformed URL — let the scraper handle it and fail naturally
    }
  }

  const jobId = crypto.randomUUID();

  await adminDb.collection("extraction_jobs").doc(jobId).set({
    status: "extracting",
    slug: null,
    offer: null,
    error: null,
    createdAt: new Date(),
  });

  // Fire and forget — response is returned immediately
  runExtraction(jobId, url);

  return Response.json({ jobId }, { status: 202 });
}

