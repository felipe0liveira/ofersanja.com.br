import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const PAGE_SIZE = 9;

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let query = adminDb
    .collection("offers")
    .where("scrapped_at", ">=", todayStart)
    .orderBy("scrapped_at", "desc")
    .limit(PAGE_SIZE);

  if (cursor) {
    try {
      query = query.startAfter(new Date(cursor));
    } catch {
      return Response.json({ error: "Invalid cursor" }, { status: 400 });
    }
  }

  const snapshot = await query.get();

  const offers = snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.name as string,
      image: d.image as string,
      link: (d.link as string | null) ?? null,
      product_link: (d.product_link as string) ?? "",
      price: d.price as number,
      old_price: (d.old_price as number) ?? 0,
      coupon: (d.coupon as boolean) ?? false,
      price_with_coupon: (d.price_with_coupon as number) ?? 0,
      scrapped_at: d.scrapped_at?.toDate().toISOString() ?? null,
    };
  });

  return Response.json(
    { offers, hasMore: snapshot.docs.length === PAGE_SIZE },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
  );
}
