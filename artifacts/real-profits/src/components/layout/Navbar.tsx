import React from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [location] = useLocation();

  const links = [
    { name: "FINANCIAL CALCULATORS", href: "/calculators" },
    { name: "PRODUCTIVE TOOLS", href: "/tools" },
    { name: "WHAT IF", href: "/what-if" },
    { name: "ARTICLES", href: "/search" },
    { name: "ABOUT", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#0d9488] via-[#0ea5a5] to-[#14b8c2]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <span className="font-serif font-bold text-2xl tracking-tight text-white">
              RealProfits<span className="text-[#f5c542]">.</span>
            </span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold tracking-wider">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-[#f5c542] ${location.startsWith(link.href) ? "text-[#f5c542]" : "text-white/80"}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="hidden md:inline-flex bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-full px-6 py-2 text-sm font-bold transition-colors"
          >
            Contact Us
          </Link>

          <button 
            className="lg:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-[#0d9488] border-t border-white/10 p-4 space-y-3">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="block text-sm font-semibold text-white/80 hover:text-[#f5c542] py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/contact"
            className="block bg-[#f5c542] text-gray-900 rounded-full px-6 py-2 text-sm font-bold text-center mt-4"
            onClick={() => setIsOpen(false)}
          >
            Contact Us
          </Link>
        </div>
      )}
    </header>
  );
}
