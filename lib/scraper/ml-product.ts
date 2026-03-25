import { chromium } from "playwright-core";
import fs from "fs/promises";
import path from "path";

const SCRAPER_DEBUG = process.env.SCRAPER_DEBUG === "true";

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

const EXECUTABLE_PATH =
  process.env.CHROMIUM_EXECUTABLE_PATH ?? "/usr/bin/chromium-browser";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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
 * Resolves a short ML URL (meli.la/…) to the canonical product URL.
 * The redirect page renders an anchor with class `.poly-component__link`
 * containing the full product href.
 */
export async function resolveShortUrl(
  shortUrl: string,
  page: import("playwright-core").Page
): Promise<string> {
  await page.goto(shortUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(1_500);

  const href = await page
    .locator(".poly-action-links__action a.poly-component__link")
    .first()
    .getAttribute("href");

  if (!href) throw new Error(`Could not resolve short URL: ${shortUrl}`);
  return cleanUrl(href);
}

/**
 * Opens a minimal browser session to resolve a short URL to its canonical
 * product link, then extracts the slug from the path. Used to do an early
 * conflict check before running the full scrape.
 */
export async function resolveProductSlug(url: string): Promise<string> {
  if (!isShortUrl(url)) {
    // For direct ML links the slug is already in the URL
    const raw = new URL(url).pathname.split("/").filter(Boolean)[0];
    if (!raw) throw new Error("Could not extract slug from URL");
    return normalizeSlug(raw);
  }

  const browser = await chromium.launch({
    executablePath: EXECUTABLE_PATH,
    headless: true,
    args: ["--disable-blink-features=AutomationControlled", "--disable-dev-shm-usage", "--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();
    const canonicalUrl = await resolveShortUrl(url, page);
    const raw = new URL(canonicalUrl).pathname.split("/").filter(Boolean)[0];
    if (!raw) throw new Error("Could not extract slug from resolved URL");
    return normalizeSlug(raw);
  } finally {
    await browser.close();
  }
}

function parseMoneyLabel(label: string): number {
  // aria-label format: "449 reais com 99 centavos" or "282 reais"
  const match = label.match(/(\d+(?:\.\d+)*) reais(?: com (\d+) centavos)?/);
  if (!match) return 0;
  const reais = parseInt(match[1].replace(/\./g, ""), 10);
  const centavos = match[2] ? parseInt(match[2], 10) : 0;
  return parseFloat(`${reais}.${String(centavos).padStart(2, "0")}`);
}

async function debugScreenshot(
  page: import("playwright-core").Page,
  label: string
): Promise<void> {
  if (!SCRAPER_DEBUG) return;
  try {
    const filename = `scraper-${Date.now()}-${label.replace(/[^a-z0-9]/gi, "_")}.png`;
    const filepath = path.join("/tmp", filename);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`[scraper] screenshot saved: ${filepath}`);
  } catch (e) {
    console.warn(`[scraper] screenshot failed: ${e}`);
  }
}

export async function scrapeMlProduct(url: string): Promise<MlProductData> {
  const browser = await chromium.launch({
    executablePath: EXECUTABLE_PATH,
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1920, height: 1080 },
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    extraHTTPHeaders: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept-Encoding": "gzip, deflate, br",
    },
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    (window as unknown as Record<string, unknown>).chrome = { runtime: {} };
    const origQuery = window.navigator.permissions.query.bind(
      window.navigator.permissions
    );
    window.navigator.permissions.query = (parameters: PermissionDescriptor) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: "denied" } as PermissionStatus)
        : origQuery(parameters);
  });

  const page = await context.newPage();

  // Resolve short URLs (meli.la/…) to the canonical product URL
  let productLink: string;
  if (isShortUrl(url)) {
    try {
      productLink = await resolveShortUrl(url, page);
    } catch (err) {
      await browser.close();
      throw err;
    }
  } else {
    productLink = cleanUrl(url);
  }

  // Navigate with retries
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(productLink, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      lastError = undefined;
      break;
    } catch (err) {
      lastError = err;
      await page.waitForTimeout(1_500 * (attempt + 1));
    }
  }
  if (lastError) {
    await debugScreenshot(page, "nav-error");
    await browser.close();
    throw lastError;
  }

  // ── Diagnostic logging ────────────────────────────────────────────────────
  const diagTitle = await page.title();
  const diagUrl = page.url();
  console.log(`[scraper] nav done — title="${diagTitle}" url="${diagUrl}"`);

  // Post-load wait + gradual scroll to trigger lazy content
  await page.waitForTimeout(2_000);
  const viewportHeight = 1080;
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < pageHeight; y += viewportHeight) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(300);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // ── Fail-fast: verify the product page actually loaded ────────────────────
  const titleCount = await page.locator("h1.ui-pdp-title").count();
  if (titleCount === 0) {
    const bodySnippet = await page.evaluate(
      () => document.body?.innerText?.slice(0, 500) ?? ""
    );
    console.error(
      `[scraper] product page not found — title="${diagTitle}" url="${diagUrl}" body="${bodySnippet}"`
    );
    await debugScreenshot(page, "blocked");
    await browser.close();
    throw new Error(
      `ML page did not load product. title="${diagTitle}" url="${diagUrl}"`
    );
  }

  await debugScreenshot(page, "loaded");

  // ── Extraction ────────────────────────────────────────────────────────────

  const name = (
    await page.locator("h1.ui-pdp-title").textContent()
  )?.trim() ?? "";

  const image =
    (await page
      .locator(".ui-pdp-gallery__figure__image")
      .first()
      .getAttribute("src")) ?? "";

  const priceContent =
    (await page
      .locator('meta[itemprop="price"]')
      .first()
      .getAttribute("content")) ?? "0";
  const price = parseFloat(priceContent) || 0;

  let old_price = 0;
  try {
    const oldPriceLabel = await page
      .locator("s.ui-pdp-price__original-value")
      .first()
      .getAttribute("aria-label");
    if (oldPriceLabel) old_price = parseMoneyLabel(oldPriceLabel);
  } catch {
    // optional field
  }

  let rating = "";
  try {
    rating =
      (await page
        .locator(".ui-pdp-review__label .andes-visually-hidden")
        .first()
        .textContent())?.trim() ?? "";
  } catch {
    // optional field
  }

  let seller = "";
  try {
    seller =
      (await page
        .locator(".ui-pdp-seller__link span")
        .first()
        .textContent())?.trim() ?? "";
  } catch {
    // optional field
  }

  let coupon_description = "";
  try {
    const rawCoupon = await page
      .locator("label.ui-vpp-coupons-awareness__checkbox-label")
      .first()
      .textContent();
    coupon_description = rawCoupon?.trim().replace(/\s+/g, " ") ?? "";
  } catch {
    // optional field
  }

  const coupon = coupon_description.length > 0;

  let price_with_coupon = 0;
  if (coupon && price > 0) {
    const pctMatch = coupon_description.match(/(\d+)%\s*OFF/i);
    if (pctMatch) {
      const pct = parseInt(pctMatch[1], 10);
      price_with_coupon = parseFloat(
        (price * (1 - pct / 100)).toFixed(2)
      );
    }
  }

  await browser.close();

  return {
    name,
    image,
    product_link: productLink,
    price,
    old_price,
    coupon,
    coupon_description,
    price_with_coupon,
    rating,
    seller,
    scrapped_at: new Date(),
  };
}
