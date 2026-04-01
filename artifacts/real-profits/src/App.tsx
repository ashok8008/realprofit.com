import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Category from "@/pages/Category";
import ArticleDetail from "@/pages/Article";
import CalculatorHub from "@/pages/CalculatorHub";
import CalculatorDetail from "@/pages/CalculatorDetail";
import ToolsHub from "@/pages/ToolsHub";
import ToolDetail from "@/pages/ToolDetail";
import Search from "@/pages/Search";
import PseoPage from "@/pages/PseoPage";
import WhatIfSimulator from "@/pages/WhatIfSimulator";

// Static pages
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import EditorialPolicy from "@/pages/EditorialPolicy";
import Disclaimer from "@/pages/Disclaimer";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
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
