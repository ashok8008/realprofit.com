import React from "react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";
import { ArrowRight, Calculator, BookOpen } from "lucide-react";

export default function Home() {
  const latestArticles = articles.slice(0, 3);
  
  return (
    <div className="w-full">
      <Seo 
        title="Practical Money Clarity"
        description="RealProfits is a mass-market personal finance resource for everyday Americans. Clear, practical, non-hype money education."
        path="/"
      />
      
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Practical money clarity <br className="hidden md:block"/> for everyday life.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No jargon. No hype. Just calm, editorial guidance to help you navigate saving, taxes, debt, and the financial decisions that matter.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link href="/calculators" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              <Calculator className="mr-2 h-4 w-4" />
              Use our Calculators
            </Link>
            <Link href="/category/money-basics" className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              <BookOpen className="mr-2 h-4 w-4" />
              Start with Basics
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="font-serif text-3xl font-bold mb-8 text-center">Explore Topics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 8).map(cat => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="group block h-full">
              <div className="h-full rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{cat.description}</p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Ad Placeholder */}
      <div className="container mx-auto px-4 py-8">
        <div className="w-full bg-muted/50 border border-muted flex items-center justify-center h-32 rounded text-muted-foreground text-sm font-mono tracking-widest uppercase">
          Advertisement Placeholder
        </div>
      </div>

      {/* Latest Articles */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-serif text-3xl font-bold">Latest Reads</h2>
            <Link href="/search" className="text-primary font-medium hover:underline flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestArticles.map(article => (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="group flex flex-col h-full bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all">
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-semibold text-primary mb-3 uppercase tracking-wider">
                    {categories.find(c => c.slug === article.categorySlug)?.name}
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow">
                    {article.excerpt}
                  </p>
                  <div className="text-xs text-muted-foreground mt-auto">
                    {article.author} &middot; {article.readTime} min read
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 container mx-auto px-4">
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-16 text-center max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Clear money talk in your inbox.</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join 50,000+ readers getting our weekly roundup of practical financial guides, relatable stories, and new tools.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex h-12 w-full rounded-md border border-input/20 bg-primary-foreground/10 px-3 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2 focus:ring-offset-primary"
              required
            />
            <button type="submit" className="inline-flex h-12 items-center justify-center rounded-md bg-primary-foreground text-primary px-8 text-sm font-bold shadow transition-colors hover:bg-primary-foreground/90">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
