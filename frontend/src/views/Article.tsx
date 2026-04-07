"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Seo, buildArticleSchema, buildBreadcrumbSchema } from "@/components/Seo";
import { articles } from "@/data/articles";
import { categories } from "@/data/categories";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { autoLinkContent, YouMightAlsoNeed, RelatedArticles } from "@/components/linking/InternalLinks";

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(...autoLinkContent(remaining.substring(0, boldMatch.index)));
      }
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
      remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
    } else {
      parts.push(...autoLinkContent(remaining));
      break;
    }
  }
  return parts;
}

function renderMarkdownContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentBlock: string[] = [];
  let key = 0;

  function flushBlock() {
    if (currentBlock.length === 0) return;
    const text = currentBlock.join('\n').trim();
    if (!text) { currentBlock = []; return; }

    if (text.match(/^[-*]\s/m) && text.split('\n').every(l => !l.trim() || l.trim().match(/^[-*]\s/))) {
      const items = text.split('\n').filter(l => l.trim());
      elements.push(
        <ul key={key++} className="list-disc pl-6 mb-6 space-y-2">
          {items.map((item, j) => (
            <li key={j} className="text-foreground/90 leading-relaxed">
              {renderInlineMarkdown(item.replace(/^[-*]\s+/, ''))}
            </li>
          ))}
        </ul>
      );
    } else if (text.match(/^\d+\.\s/m) && text.split('\n').every(l => !l.trim() || l.trim().match(/^\d+\.\s/))) {
      const items = text.split('\n').filter(l => l.trim());
      elements.push(
        <ol key={key++} className="list-decimal pl-6 mb-6 space-y-2">
          {items.map((item, j) => (
            <li key={j} className="text-foreground/90 leading-relaxed">
              {renderInlineMarkdown(item.replace(/^\d+\.\s+/, ''))}
            </li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <p key={key++} className="mb-6 text-foreground/90 leading-relaxed">
          {renderInlineMarkdown(text)}
        </p>
      );
    }
    currentBlock = [];
  }

  for (const line of lines) {
    if (line.startsWith('### ')) {
      flushBlock();
      elements.push(
        <h3 key={key++} className="text-xl font-bold mt-8 mb-3 font-serif">
          {renderInlineMarkdown(line.replace('### ', ''))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      flushBlock();
      elements.push(
        <h2 key={key++} className="text-2xl font-bold mt-10 mb-4 font-serif">
          {renderInlineMarkdown(line.replace('## ', ''))}
        </h2>
      );
    } else if (line.trim() === '') {
      flushBlock();
    } else {
      currentBlock.push(line);
    }
  }
  flushBlock();

  return elements;
}

export default function ArticleDetail() {
  const { slug } = useParams() as { slug: string };
  const article = articles.find(a => a.slug === slug);

  if (!article) {
    return <div className="container mx-auto py-20 text-center">Article not found</div>;
  }

  const category = categories.find(c => c.slug === article.categorySlug);
  const subcategory = category?.subcategories.find(s => s.slug === article.subcategorySlug);

  const articleSchema = buildArticleSchema({
    title: article.title,
    excerpt: article.excerpt,
    author: article.author,
    date: article.date,
    slug: article.slug,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://realprofits.com" },
    ...(category ? [{ name: category.name, url: `https://realprofits.com/category/${category.slug}` }] : []),
    { name: article.title, url: `https://realprofits.com/articles/${article.slug}` },
  ]);

  return (
    <div className="w-full bg-background">
      <Seo
        title={article.title}
        description={article.excerpt}
        keywords={`${article.title.toLowerCase()}, ${article.categorySlug.replace(/-/g, ' ')}, personal finance article, money advice, financial tips, ${article.subcategorySlug.replace(/-/g, ' ')}`}
        path={`/articles/${article.slug}`}
        type="article"
        jsonLd={[articleSchema, breadcrumbSchema]}
      />

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          {category && (
            <>
              <Link href={`/category/${category.slug}`} className="hover:text-foreground">{category.name}</Link>
              <ChevronRight className="h-4 w-4 mx-2" />
            </>
          )}
          {subcategory && (
            <Link href={`/category/${category?.slug}/${subcategory.slug}`} className="hover:text-foreground">{subcategory.name}</Link>
          )}
        </nav>

        <header className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
            {article.title}
          </h1>

          <div id="ai-summary" className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-6">
            <p className="text-sm font-semibold text-teal-800 mb-1">TL;DR</p>
            <p className="text-gray-800 text-sm">{article.excerpt}</p>
          </div>

          <div className="flex items-center justify-between border-y py-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="font-medium">{article.author}</div>
              <div className="text-muted-foreground">{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div className="text-muted-foreground">&middot;</div>
              <div className="text-muted-foreground">{article.readTime} min read</div>
            </div>

            <div className="flex gap-2">
               <Button variant="outline" size="sm">Share</Button>
            </div>
          </div>
        </header>

        <div className="prose prose-lg prose-headings:font-serif prose-a:text-primary hover:prose-a:text-primary/80 max-w-none">
          {renderMarkdownContent(article.content)}
        </div>

        <RelatedArticles categorySlug={article.categorySlug} currentSlug={article.slug} />

        <YouMightAlsoNeed currentCategory={article.categorySlug} currentSlug={article.slug} />

        <div className="mt-16 bg-muted/30 border p-8 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xl mb-2">Want more financial clarity?</h3>
            <p className="text-muted-foreground">Sign up for our weekly newsletter for more practical advice.</p>
          </div>
          <Button>Subscribe</Button>
        </div>
      </article>
    </div>
  );
}
