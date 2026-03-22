import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";

const ALLOWED_HOSTS = [
  "mlstatic.com",
  "amazonaws.com",
  "googleusercontent.com",
  "shopify.com",
  "vteximg.com.br",
  "vtexassets.com",
  "magazineluiza.com.br",
  "magazinevoce.com.br",
  "americanas.com.br",
  "casasbahia.com.br",
  "carrefour.com.br",
];

function isAllowedHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  const imageUrl = request.nextUrl.searchParams.get("url");

  if (!imageUrl || !isAllowedHost(imageUrl)) {
    return new Response("URL not allowed", { status: 400 });
  }

  const upstream = await fetch(imageUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Ofersanja/1.0)" },
  });

  if (!upstream.ok) {
    return new Response("Failed to fetch image", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
  const buffer = await upstream.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
