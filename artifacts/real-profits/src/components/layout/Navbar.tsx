import React from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [location] = useLocation();

  const links = [
    { name: "Financial Calculators", href: "/calculators" },
    { name: "What If", href: "/what-if" },
    { name: "Articles", href: "/search" },
    { name: "Tools", href: "/tools" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif font-bold text-2xl tracking-tight text-primary">
              RealProfits.
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={`transition-colors hover:text-primary ${location.startsWith(link.href) ? "text-primary" : "text-muted-foreground"}`}>
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-4">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="block text-sm font-medium text-foreground py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
