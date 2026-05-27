/**
 * Post-build pinger for IndexNow (Bing + Yandex) + Google sitemap ping.
 * Runs after `next build` via the `postbuild` npm hook.
 *
 * Behavior:
 *   1. Submits all URLs from the sub-sitemaps (~1,800 URLs) to IndexNow in
 *      chunks of 10,000.
 *   2. Pings Google's deprecated-but-still-functional sitemap endpoint with
 *      the sitemap index URL.
 *
 * Skips when:
 *   - NEXT_PUBLIC_SITE_URL is a localhost/preview/0.0.0.0 URL (production-only)
 *   - PING_SEARCH_ENGINES=0 in env (manual override)
 */
import {
  SECTION_LOADERS,
  SITEMAP_SECTIONS,
  SITEMAP_BASE,
} from "../src/lib/sitemap-data";
import { INDEXNOW_KEY } from "../src/lib/indexnow-key";

const INDEXNOW_HOSTS = [
  "https://api.indexnow.org/IndexNow",
  "https://www.bing.com/IndexNow",
  "https://yandex.com/indexnow",
];

const CHUNK_SIZE = 10000;

function host(u: string): string {
  try {
    return new URL(u).host;
  } catch {
    return u;
  }
}

function isProdUrl(u: string): boolean {
  if (!u) return false;
  const h = host(u);
  if (/(localhost|127\.|0\.0\.0\.0|preview\.emergent|emergentagent\.com|\.local)/i.test(h)) return false;
  return /^https?:\/\//i.test(u);
}

async function pingIndexNow(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  const siteHost = host(SITEMAP_BASE);

  for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
    const chunk = urls.slice(i, i + CHUNK_SIZE);
    const body = {
      host: siteHost,
      key: INDEXNOW_KEY,
      keyLocation: `${SITEMAP_BASE}/${INDEXNOW_KEY}.txt`,
      urlList: chunk,
    };

    await Promise.all(
      INDEXNOW_HOSTS.map(async (endpoint) => {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(body),
          });
          const tag = endpoint.replace("https://", "").split("/")[0];
          console.log(
            `[ping] ${tag} → ${res.status} ${res.statusText} (${chunk.length} URLs, chunk ${i / CHUNK_SIZE + 1})`,
          );
        } catch (e) {
          console.warn(`[ping] ${endpoint} failed:`, (e as Error).message);
        }
      }),
    );
  }
}

async function pingGoogle(): Promise<void> {
  const sitemapUrl = `${SITEMAP_BASE}/sitemap.xml`;
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
  try {
    const res = await fetch(pingUrl, { method: "GET" });
    if (res.status === 404) {
      console.log(
        `[ping] google → 404 (endpoint deprecated June 2023). Submit ${sitemapUrl} manually via Google Search Console once.`,
      );
    } else {
      console.log(`[ping] google → ${res.status} ${res.statusText} (${sitemapUrl})`);
    }
  } catch (e) {
    console.warn(`[ping] google failed:`, (e as Error).message);
  }
}

async function main(): Promise<void> {
  if (process.env.PING_SEARCH_ENGINES === "0") {
    console.log("[ping] skipped (PING_SEARCH_ENGINES=0)");
    return;
  }
  if (!isProdUrl(SITEMAP_BASE)) {
    console.log(`[ping] skipped — non-production base URL: ${SITEMAP_BASE}`);
    return;
  }

  const allUrls: string[] = [];
  for (const sec of SITEMAP_SECTIONS) {
    const entries = SECTION_LOADERS[sec.id]();
    for (const e of entries) allUrls.push(e.loc);
  }
  console.log(`[ping] ${allUrls.length} URLs to submit (base=${SITEMAP_BASE})`);

  await pingIndexNow(allUrls);
  await pingGoogle();
  console.log("[ping] done.");
}

main().catch((e) => {
  console.warn("[ping] fatal:", e);
  // Never fail the build on a ping error.
  process.exit(0);
});
