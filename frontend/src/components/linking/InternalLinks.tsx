import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Calculator, Wrench } from "lucide-react";
import { articles } from "@/data/articles";
import { calculators } from "@/data/calculators";
import { tools } from "@/data/tools";
import { categories } from "@/data/categories";

export function BreadcrumbNav({ items }: { items: { label: string, href: string }[] }) {
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-2">
      <Link href="/" className="hover:text-foreground">Home</Link>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
          <Link href={item.href} className={`hover:text-foreground ${i === items.length - 1 ? 'text-foreground font-medium' : ''}`}>
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}

export function RelatedArticles({ categorySlug, currentSlug }: { categorySlug: string, currentSlug?: string }) {
  const related = articles
    .filter(a => a.categorySlug === categorySlug && a.slug !== currentSlug)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-12 border-t pt-10">
      <h3 className="font-serif text-2xl font-bold mb-6">Read Next</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map(article => (
          <Link key={article.slug} href={`/articles/${article.slug}`} className="group block">
            <div className="border rounded-lg p-5 h-full transition-all hover:border-primary hover:shadow-sm bg-card">
              <h4 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CalculatorInlineCard({ slug }: { slug: string }) {
  const calc = calculators.find(c => c.slug === slug);
  if (!calc) return null;

  return (
    <div className="my-8 bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex gap-4">
        <div className="bg-primary/10 p-3 rounded-full h-fit">
          <Calculator className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-lg">{calc.name}</h4>
          <p className="text-sm text-muted-foreground">{calc.description}</p>
        </div>
      </div>
      <Link href={`/calculators/${calc.slug}`} className="whitespace-nowrap inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
        Try it now
      </Link>
    </div>
  );
}

const keywordMap: { keyword: string; href: string; label: string }[] = [
  ...calculators.map(c => ({ keyword: c.name.replace(' Calculator', '').toLowerCase(), href: `/calculators/${c.slug}`, label: c.name })),
  ...tools.map(t => ({ keyword: t.name.toLowerCase(), href: `/tools/${t.slug}`, label: t.name })),
];

export function autoLinkContent(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  let linked = 0;

  while (remaining.length > 0 && linked < 3) {
    let earliest = -1;
    let match: typeof keywordMap[0] | null = null;
    let matchLen = 0;

    for (const kw of keywordMap) {
      const idx = remaining.toLowerCase().indexOf(kw.keyword);
      if (idx !== -1 && (earliest === -1 || idx < earliest)) {
        earliest = idx;
        match = kw;
        matchLen = kw.keyword.length;
      }
    }

    if (match && earliest !== -1) {
      if (earliest > 0) parts.push(remaining.substring(0, earliest));
      const originalText = remaining.substring(earliest, earliest + matchLen);
      parts.push(
        <Link key={key++} href={match.href} className="text-teal-600 underline decoration-teal-300 hover:text-teal-800 transition-colors">
          {originalText}
        </Link>
      );
      remaining = remaining.substring(earliest + matchLen);
      linked++;
    } else {
      parts.push(remaining);
      break;
    }
  }

  if (remaining.length > 0 && linked >= 3) {
    parts.push(remaining);
  }

  return parts;
}

const categoryMapping: Record<string, string[]> = {
  "savings-budget": ["investing-calc", "debt-credit-calc", "income-freelance"],
  "income-freelance": ["taxes-calc", "savings-budget"],
  "taxes-calc": ["income-freelance", "savings-budget"],
  "investing-calc": ["savings-budget", "debt-credit-calc"],
  "debt-credit-calc": ["savings-budget", "investing-calc"],
  "life-decisions-calc": ["savings-budget", "investing-calc", "debt-credit-calc"],
  "loans-calc": ["debt-credit-calc", "savings-budget"],
  "income": ["taxes-calc", "savings-budget", "income-freelance"],
  "budget": ["savings-budget", "debt-credit-calc"],
  "wealth": ["investing-calc", "savings-budget"],
  "money-basics": ["savings-budget", "debt-credit-calc"],
  "income-side-hustles": ["income-freelance", "taxes-calc"],
  "taxes": ["taxes-calc", "income-freelance"],
  "saving-vs-investing": ["investing-calc", "savings-budget"],
  "debt-credit": ["debt-credit-calc", "savings-budget"],
  "life-decisions": ["life-decisions-calc", "savings-budget"],
  "real-stories": ["savings-budget", "debt-credit-calc"],
};

export function YouMightAlsoNeed({ currentCategory, currentSlug }: { currentCategory: string; currentSlug?: string }) {
  const relatedCategories = categoryMapping[currentCategory] || ["savings-budget", "investing-calc"];
  const suggestions: { name: string; description: string; href: string; type: "calculator" | "tool" }[] = [];

  for (const cat of relatedCategories) {
    for (const c of calculators) {
      if (c.category === cat && c.slug !== currentSlug && suggestions.length < 3) {
        suggestions.push({ name: c.name, description: c.description, href: `/calculators/${c.slug}`, type: "calculator" });
      }
    }
    if (suggestions.length >= 3) break;
  }

  if (suggestions.length < 3) {
    for (const t of tools) {
      if (t.slug !== currentSlug && suggestions.length < 3) {
        suggestions.push({ name: t.name, description: t.description, href: `/tools/${t.slug}`, type: "tool" });
      }
    }
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-12 border-t pt-10">
      <h3 className="font-serif text-2xl font-bold mb-6">You Might Also Need</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {suggestions.map(s => (
          <Link key={s.href} href={s.href} className="group block">
            <div className="border rounded-xl p-5 h-full transition-all hover:border-teal-400 hover:shadow-sm bg-white flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                {s.type === "calculator"
                  ? <Calculator className="h-4 w-4 text-teal-600" />
                  : <Wrench className="h-4 w-4 text-teal-600" />}
                <span className="text-[10px] uppercase tracking-wider font-bold text-teal-600">{s.type}</span>
              </div>
              <h4 className="font-bold text-sm mb-1 group-hover:text-teal-600 transition-colors">{s.name}</h4>
              <p className="text-xs text-gray-500 flex-grow">{s.description}</p>
              <div className="mt-3 text-xs font-bold text-teal-600 flex items-center">
                Try Now <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
