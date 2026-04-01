import React from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight, Calculator } from "lucide-react";
import { articles } from "@/data/articles";
import { calculators } from "@/data/calculators";
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
