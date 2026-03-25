const ML_AFFILIATE_TAG = "oa20260120140349";
const ML_CREATE_LINK_URL =
  "https://www.mercadolivre.com.br/affiliate-program/api/v2/affiliates/createLink";

/**
 * Calls the ML affiliate API to generate a short affiliate link for a product URL.
 * Returns the `short_url` (e.g. https://meli.la/XXXXXXX) on success, null on any failure.
 */
export async function createAffiliateLink(
  productUrl: string
): Promise<string | null> {
  const ssid = process.env.ML_AFFILIATE_SSID;
  if (!ssid) {
    console.warn("[affiliate] ML_AFFILIATE_SSID not set — skipping affiliate link generation");
    return null;
  }

  try {
    const res = await fetch(ML_CREATE_LINK_URL, {
      method: "POST",
      headers: {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "origin": "https://www.mercadolivre.com.br",
        "referer": "https://www.mercadolivre.com.br/afiliados/hub",
        "cookie": `ssid=${ssid}`,
        "x-requested-with": "XMLHttpRequest",
      },
      body: JSON.stringify({
        tag: ML_AFFILIATE_TAG,
        urls: [productUrl],
      }),
    });

    if (!res.ok) {
      console.warn(`[affiliate] createLink returned HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    const shortUrl: string | undefined = data?.urls?.[0]?.short_url;
    if (!shortUrl) {
      console.warn("[affiliate] short_url missing in response", data);
      return null;
    }

    return shortUrl;
  } catch (err) {
    console.warn("[affiliate] createLink request failed:", err);
    return null;
  }
}
