import React from "react";
import { Link, useParams } from "wouter";
import { Seo } from "@/components/Seo";
import { articles } from "@/data/articles";
import { categories } from "@/data/categories";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find(a => a.slug === slug);
  
  if (!article) {
    return <div className="container mx-auto py-20 text-center">Article not found</div>;
  }

  const category = categories.find(c => c.slug === article.categorySlug);
  const subcategory = category?.subcategories.find(s => s.slug === article.subcategorySlug);

  return (
    <div className="w-full bg-background">
      <Seo 
        title={article.title}
        description={article.excerpt}
        path={`/articles/${article.slug}`}
        type="article"
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
        
        <header className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
            {article.title}
          </h1>
          
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
          {/* Simple markdown parsing for the example content */}
          {article.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('## ')) {
              return <h2 key={i} className="text-2xl font-bold mt-10 mb-4">{paragraph.replace('## ', '')}</h2>;
            }
            return <p key={i} className="mb-6 text-foreground/90 leading-relaxed">{paragraph}</p>;
          })}
        </div>

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
