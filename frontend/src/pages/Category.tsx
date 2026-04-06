import React from "react";
import { Link, useParams } from "wouter";
import { Seo } from "@/components/Seo";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function Category() {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string, subcategorySlug?: string }>();
  
  const category = categories.find(c => c.slug === categorySlug);
  
  if (!category) {
    return <div className="container mx-auto py-20 text-center">Category not found</div>;
  }

  const subcategory = subcategorySlug 
    ? category.subcategories.find(s => s.slug === subcategorySlug)
    : null;

  const title = subcategory ? `${subcategory.name} | ${category.name}` : category.name;
  
  const filteredArticles = articles.filter(a => {
    if (a.categorySlug !== category.slug) return false;
    if (subcategorySlug && a.subcategorySlug !== subcategorySlug) return false;
    return true;
  });

  return (
    <div className="w-full">
      <Seo 
        title={title}
        description={category.description}
        keywords={`${category.name.toLowerCase()}, ${subcategory ? subcategory.name.toLowerCase() + ', ' : ''}personal finance, money articles, financial education, ${category.slug.replace(/-/g, ' ')}`}
        path={`/category/${categorySlug}${subcategorySlug ? `/${subcategorySlug}` : ''}`}
      />
      
      <div className="bg-muted/30 py-12 border-b">
        <div className="container mx-auto px-4">
          <nav className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href={`/category/${category.slug}`} className={`hover:text-foreground ${!subcategorySlug ? 'text-foreground font-medium' : ''}`}>
              {category.name}
            </Link>
            {subcategory && (
              <>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">{subcategory.name}</span>
              </>
            )}
          </nav>
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {subcategory ? subcategory.name : category.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {subcategory ? subcategory.description || `Articles and resources about ${subcategory.name.toLowerCase()}.` : category.description}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-3/4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No articles published in this category yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredArticles.map(article => (
                <article key={article.slug} className="group border-b pb-10 last:border-0 last:pb-0">
                  <div className="text-sm text-primary font-medium mb-2 uppercase tracking-wide">
                    {category.subcategories.find(s => s.slug === article.subcategorySlug)?.name || article.subcategorySlug}
                  </div>
                  <h2 className="font-serif text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                  </h2>
                  <p className="text-muted-foreground mb-4 max-w-3xl">
                    {article.excerpt}
                  </p>
                  <Link href={`/articles/${article.slug}`} className="inline-flex items-center text-sm font-bold text-primary hover:underline">
                    Read article <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
        
        <aside className="w-full md:w-1/4 space-y-8">
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-bold mb-4">Subtopics</h3>
            <ul className="space-y-3">
              {category.subcategories.map(sub => (
                <li key={sub.slug}>
                  <Link 
                    href={`/category/${category.slug}/${sub.slug}`}
                    className={`block text-sm transition-colors hover:text-primary ${subcategorySlug === sub.slug ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-muted/50 border flex flex-col items-center justify-center h-64 rounded p-6 text-center">
            <span className="text-xs text-muted-foreground font-mono tracking-widest uppercase mb-2">Ad Placeholder</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
