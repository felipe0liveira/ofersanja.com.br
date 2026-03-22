import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { Offer } from "@/lib/types/offer";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const idToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!idToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await adminAuth.verifyIdToken(idToken);
  } catch {
    return Response.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const snapshot = await adminDb
    .collection("offers")
    .where("scrapped_at", ">=", todayStart)
    .orderBy("scrapped_at", "desc")
    .get();

  const offers: Offer[] = snapshot.docs
    .filter((doc) => !doc.data().dispatched_at)
    .map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      image: data.image,
      link: data.link,
      price: data.price,
      old_price: data.old_price,
      coupon: data.coupon,
      coupon_price: data.coupon_price,
      price_with_coupon: data.price_with_coupon,
      seller: data.seller,
      rating: data.rating,
      time_limited: data.time_limited,
      expiration_datetime: data.expiration_datetime?.toDate().toISOString() ?? null,
      scrapped_at: data.scrapped_at?.toDate().toISOString() ?? null,
    };
  });

  return Response.json({ offers });
}
