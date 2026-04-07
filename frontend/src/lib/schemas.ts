// Schema builders - pure functions safe for server components

export function buildArticleSchema(article: {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Person", name: article.author },
    datePublished: article.date,
    publisher: {
      "@type": "Organization",
      name: "RealProfits",
      url: "https://realprofits.com",
    },
    mainEntityOfPage: `https://realprofits.com/articles/${article.slug}`,
  };
}

export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildSoftwareAppSchema(calc: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: calc.name,
    description: calc.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `https://realprofits.com/calculators/${calc.slug}`,
  };
}

export function buildHowToSchema(guide: {
  title: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.description,
    step: guide.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildWebApplicationSchema(tool: {
  name: string;
  description: string;
  slug: string;
  section: string;
}) {
  const isIRSPrep = tool.section === "irs-prep";
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description + (isIRSPrep ? " Prep worksheet only — not for IRS submission." : ""),
    applicationCategory: "FinanceApplication",
    applicationSubCategory: isIRSPrep ? "Tax Preparation" : "Tax Planning",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `https://realprofits.com/tax-tools/${tool.slug}`,
    creator: {
      "@type": "Organization",
      name: "RealProfits",
      url: "https://realprofits.com",
    },
  };
}

export function buildItemListSchema(items: { name: string; url: string; description: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      description: item.description,
      url: item.url,
    })),
  };
}
