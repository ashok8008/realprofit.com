import React, { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";

// Lazy-loaded route pages for code splitting
const Category = lazy(() => import("@/pages/Category"));
const ArticleDetail = lazy(() => import("@/pages/Article"));
const CalculatorHub = lazy(() => import("@/pages/CalculatorHub"));
const CalculatorDetail = lazy(() => import("@/pages/CalculatorDetail"));
const ToolsHub = lazy(() => import("@/pages/ToolsHub"));
const ToolDetail = lazy(() => import("@/pages/ToolDetail"));
const CareerToolsHub = lazy(() => import("@/pages/career-tools/CareerToolsHub"));
const CareerToolDetail = lazy(() => import("@/pages/career-tools/CareerToolDetail"));
const Search = lazy(() => import("@/pages/Search"));
const PseoPage = lazy(() => import("@/pages/PseoPage"));
const GuidesHub = lazy(() => import("@/pages/GuidesHub"));
const WhatIfSimulator = lazy(() => import("@/pages/WhatIfSimulator"));

// Static pages
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const EditorialPolicy = lazy(() => import("@/pages/EditorialPolicy"));
const Disclaimer = lazy(() => import("@/pages/Disclaimer"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (window.dataLayer) {
      window.dataLayer.push({
        event: "virtualPageview",
        pagePath: location,
        pageTitle: document.title,
      });
    }
  }, [location]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Switch>
        <Route path="/" component={Home} />
        
        <Route path="/category/:categorySlug" component={Category} />
        <Route path="/category/:categorySlug/:subcategorySlug" component={Category} />
        <Route path="/articles/:slug" component={ArticleDetail} />
        
        <Route path="/calculators" component={CalculatorHub} />
        <Route path="/calculators/:slug" component={CalculatorDetail} />
        
        <Route path="/what-if" component={WhatIfSimulator} />
        
        <Route path="/tools" component={ToolsHub} />
        <Route path="/tools/:slug" component={ToolDetail} />
        
        <Route path="/career-tools" component={CareerToolsHub} />
        <Route path="/career-tools/:slug" component={CareerToolDetail} />
        
        <Route path="/guides" component={GuidesHub} />
        <Route path="/guides/:slug" component={PseoPage} />
        <Route path="/search" component={Search} />
        
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/editorial-policy" component={EditorialPolicy} />
        <Route path="/disclaimer" component={Disclaimer} />
        
        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
