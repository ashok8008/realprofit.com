/**
 * Server-safe JSON-LD emitter. Use inside any page (server or client) to
 * inject structured data that Google, Bing, ChatGPT, Claude, Perplexity etc.
 * read to understand the page.
 *
 * Render BEFORE the rest of the page so crawlers see it first.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
