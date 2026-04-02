import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { articles } from "@/data/articles";
import { calculators } from "@/data/calculators";
import { tools } from "@/data/tools";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { articles: [], calculators: [], tools: [] };

    const matchedArticles = articles.filter(
      a => a.title.toLowerCase().includes(q) ||
           a.excerpt.toLowerCase().includes(q) ||
           a.categorySlug.toLowerCase().includes(q)
    ).slice(0, 10);

    const matchedCalcs = calculators.filter(
      c => c.name.toLowerCase().includes(q) ||
           c.description.toLowerCase().includes(q)
    ).slice(0, 10);

    const matchedTools = tools.filter(
      t => t.name.toLowerCase().includes(q) ||
           t.description.toLowerCase().includes(q)
    ).slice(0, 10);

    return { articles: matchedArticles, calculators: matchedCalcs, tools: matchedTools };
  }, [query]);

  const totalResults = results.articles.length + results.calculators.length + results.tools.length;
  const hasQuery = query.trim().length > 0;

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
  };

  return (
    <div className="w-full">
      <Seo 
        title="Search"
        description="Search RealProfits articles, calculators, and guides."
        keywords="search financial articles, find calculator, personal finance search, money guides, financial tools search"
        path="/search"
      />
      
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-serif text-4xl font-bold mb-8 text-center">Search RealProfits</h1>
        <div className="flex gap-4 mb-8">
          <div className="flex-grow relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for 'emergency fund', 'taxes', etc..." 
              className="w-full h-14 rounded-lg border border-input bg-background pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {!hasQuery && (
          <div className="text-muted-foreground text-center">
            <p>Try searching for:</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["budgeting", "freelance taxes", "high yield savings", "debt snowball", "mortgage", "retirement"].map(term => (
                <button
                  key={term}
                  onClick={() => handleSuggestionClick(term)}
                  className="bg-muted px-3 py-1 rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasQuery && (
          <div className="space-y-8">
            <p className="text-sm text-muted-foreground">
              {totalResults === 0 ? `No results for "${query}"` : `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`}
            </p>

            {results.calculators.length > 0 && (
              <div>
                <h2 className="font-bold text-lg mb-3 border-b pb-2">Calculators ({results.calculators.length})</h2>
                <div className="space-y-3">
                  {results.calculators.map(c => (
                    <Link key={c.slug} href={`/calculators/${c.slug}`} className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <h3 className="font-bold text-primary">{c.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.tools.length > 0 && (
              <div>
                <h2 className="font-bold text-lg mb-3 border-b pb-2">Tools ({results.tools.length})</h2>
                <div className="space-y-3">
                  {results.tools.map(t => (
                    <Link key={t.slug} href={`/tools/${t.slug}`} className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <h3 className="font-bold text-primary">{t.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.articles.length > 0 && (
              <div>
                <h2 className="font-bold text-lg mb-3 border-b pb-2">Articles ({results.articles.length})</h2>
                <div className="space-y-3">
                  {results.articles.map(a => (
                    <Link key={a.slug} href={`/articles/${a.slug}`} className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <h3 className="font-bold text-primary">{a.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.excerpt}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{a.author}</span>
                        <span>{a.readTime} min read</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {totalResults === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Try a different search term or browse our content:</p>
                <div className="flex justify-center gap-4">
                  <Link href="/calculators" className="text-primary hover:underline font-medium">Calculators</Link>
                  <Link href="/tools" className="text-primary hover:underline font-medium">Tools</Link>
                  <Link href="/guides" className="text-primary hover:underline font-medium">Guides</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
