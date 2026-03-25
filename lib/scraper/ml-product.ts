const ML_API_BASE = "https://api.mercadolibre.com";

export type MlProductData = {
  name: string;
  image: string;
  product_link: string;
  price: number;
  old_price: number;
  coupon: boolean;
  coupon_description: string;
  price_with_coupon: number;
  rating: string;
  seller: string;
  scrapped_at: Date;
};

function cleanUrl(url: string): string {
  return url.split("#")[0].split("?")[0];
}

/** Strips the MLB-XXXXXXXX- prefix that ML includes in URL path segments. */
export function normalizeSlug(raw: string): string {
  return raw.replace(/^MLB-\d+-/i, "");
}

export function isShortUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "meli.la" || hostname === "mercadolivre.page.link";
  } catch {
    return false;
  }
}

/**
 * Distinguishes between catalog product IDs (/p/MLB…) and listing IDs (MLB-…).
 * They use different API endpoints.
 */
function extractItemInfo(url: string): { type: "catalog" | "listing"; id: string } | null {
  // Catalog page: /p/MLB59330343
  const catalogMatch = url.match(/\/p\/(MLB\d+)/i);
  if (catalogMatch) return { type: "catalog", id: catalogMatch[1].toUpperCase() };

  // Listing URL: MLB-5832566800-slug or …/MLB5832566800…
  const listingMatch = url.match(/\bMLB-?(\d+)/i);
  if (listingMatch) return { type: "listing", id: `MLB${listingMatch[1]}` };

  return null;
}

/**
 * Resolves a short ML URL (meli.la/…) to the canonical product URL by
 * following HTTP redirects — no browser required.
 */
async function resolveShortUrlViaFetch(shortUrl: string): Promise<string> {
  const resp = await fetch(shortUrl, {
    method: "GET",
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
  });
  const finalUrl = resp.url;
  if (!finalUrl || finalUrl === shortUrl) {
    throw new Error(`Could not resolve short URL: ${shortUrl}`);
  }
  return cleanUrl(finalUrl);
}

/**
 * Resolves a short ML URL to its canonical product link and extracts the slug.
 * Used to do an early conflict-check before the full scrape.
 */
export async function resolveProductSlug(url: string): Promise<string> {
  let canonicalUrl = url;
  if (isShortUrl(url)) {
    canonicalUrl = await resolveShortUrlViaFetch(url);
  }
  const raw = new URL(canonicalUrl).pathname.split("/").filter(Boolean)[0];
  if (!raw) throw new Error("Could not extract slug from URL");
  return normalizeSlug(raw);
}

// ── ML public REST API types ─────────────────────────────────────────────────

type MlApiItem = {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  thumbnail: string;
  pictures: Array<{ url: string; secure_url: string }>;
  permalink: string;
  seller_id: number;
  official_store_name: string | null;
};

type MlApiProduct = {
  id: string;
  name: string;
  thumbnail: string;
  pictures: Array<{ url: string; secure_url: string }>;
  buy_box_winner?: {
    item_id: string;
    price: number;
    original_price: number | null;
    seller_id: number;
    permalink: string;
  };
};

type MlApiUser = { nickname: string };

type MlApiReviews = { rating_average: number; total: number };

async function mlApiFetch<T>(path: string): Promise<T> {
  const resp = await fetch(`${ML_API_BASE}${path}`);
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`ML API ${path} → ${resp.status}: ${text.slice(0, 200)}`);
  }
  return resp.json() as Promise<T>;
}

function buildImage(
  pictures: Array<{ url: string; secure_url: string }> | undefined,
  thumbnail: string
): string {
  return (
    pictures?.[0]?.secure_url ||
    pictures?.[0]?.url ||
    thumbnail.replace(/-I\.jpg$/i, "-O.jpg")
  );
}

function buildRating(result: PromiseSettledResult<MlApiReviews>): string {
  if (result.status !== "fulfilled" || result.value.total === 0) return "";
  const { rating_average, total } = result.value;
  return `${rating_average.toFixed(1).replace(".", ",")} de 5 estrelas (${total} avaliações)`;
}

/**
 * Fetches product data from the ML public API.
 * - Catalog URLs (/p/MLB…) → GET /products/{id}
 * - Listing URLs (MLB-…)   → GET /items/{id}
 */
export async function scrapeMlProduct(url: string): Promise<MlProductData> {
  // 1. Resolve short URLs to canonical form
  let productUrl = isShortUrl(url) ? await resolveShortUrlViaFetch(url) : url;
  productUrl = cleanUrl(productUrl);

  // 2. Determine ID type and route to the correct endpoint
  const itemInfo = extractItemInfo(productUrl);
  if (!itemInfo) {
    throw new Error(`Could not extract ML item ID from URL: ${productUrl}`);
  }

  console.log(`[scraper] fetching ${itemInfo.type} ${itemInfo.id}`);

  if (itemInfo.type === "catalog") {
    // ── Catalog product (/products/{id}) ────────────────────────────────────
    const product = await mlApiFetch<MlApiProduct>(`/products/${itemInfo.id}`);

    const winner = product.buy_box_winner;
    const sellerId = winner?.seller_id;
    const [sellerResult, reviewsResult] = await Promise.allSettled([
      sellerId
        ? mlApiFetch<MlApiUser>(`/users/${sellerId}`)
        : Promise.reject("no seller"),
      mlApiFetch<MlApiReviews>(`/reviews/item/${itemInfo.id}`),
    ]);

    const seller =
      sellerResult.status === "fulfilled" ? sellerResult.value.nickname : "";
    const price = winner?.price ?? 0;
    const old_price = winner?.original_price ?? 0;
    const permalink = winner?.permalink ?? productUrl;

    console.log(`[scraper] done: "${product.name}" — R$ ${price}`);

    return {
      name: product.name,
      image: buildImage(product.pictures, product.thumbnail),
      product_link: permalink,
      price,
      old_price,
      coupon: false,
      coupon_description: "",
      price_with_coupon: 0,
      rating: buildRating(reviewsResult),
      seller,
      scrapped_at: new Date(),
    };
  } else {
    // ── Item listing (/items/{id}) ───────────────────────────────────────────
    const item = await mlApiFetch<MlApiItem>(`/items/${itemInfo.id}`);

    const [sellerResult, reviewsResult] = await Promise.allSettled([
      mlApiFetch<MlApiUser>(`/users/${item.seller_id}`),
      mlApiFetch<MlApiReviews>(`/reviews/item/${itemInfo.id}`),
    ]);

    const seller =
      item.official_store_name ??
      (sellerResult.status === "fulfilled" ? sellerResult.value.nickname : "");

    console.log(`[scraper] done: "${item.title}" — R$ ${item.price}`);

    return {
      name: item.title,
      image: buildImage(item.pictures, item.thumbnail),
      product_link: item.permalink,
      price: item.price ?? 0,
      old_price: item.original_price ?? 0,
      coupon: false,
      coupon_description: "",
      price_with_coupon: 0,
      rating: buildRating(reviewsResult),
      seller,
      scrapped_at: new Date(),
    };
  }
}
