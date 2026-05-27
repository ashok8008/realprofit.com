import { INDEXNOW_KEY } from "@/lib/indexnow-key";

export const dynamic = "force-static";

export function GET() {
  return new Response(INDEXNOW_KEY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
