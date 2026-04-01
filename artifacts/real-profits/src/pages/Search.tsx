import React from "react";
import { Seo } from "@/components/Seo";

export default function Search() {
  return (
    <div className="w-full">
      <Seo 
        title="Search"
        description="Search RealProfits articles, calculators, and guides."
        path="/search"
      />
      
      <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
        <h1 className="font-serif text-4xl font-bold mb-8">Search RealProfits</h1>
        <div className="flex gap-4 mb-12">
          <input 
            type="search" 
            placeholder="Search for 'emergency fund', 'taxes', etc..." 
            className="flex-grow h-14 rounded-lg border border-input bg-background px-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="h-14 bg-primary text-primary-foreground px-8 rounded-lg font-bold">
            Search
          </button>
        </div>
        <div className="text-muted-foreground">
          <p>Try searching for:</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="bg-muted px-3 py-1 rounded-full text-sm">budgeting</span>
            <span className="bg-muted px-3 py-1 rounded-full text-sm">freelance taxes</span>
            <span className="bg-muted px-3 py-1 rounded-full text-sm">high yield savings</span>
            <span className="bg-muted px-3 py-1 rounded-full text-sm">debt snowball</span>
          </div>
        </div>
      </div>
    </div>
  );
}
