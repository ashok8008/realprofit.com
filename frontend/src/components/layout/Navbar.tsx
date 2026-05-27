"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, UserCircle, ChevronDown, Receipt, FileSignature } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [productiveOpen, setProductiveOpen] = React.useState(false);
  const productiveRef = React.useRef<HTMLDivElement>(null);
  const location = usePathname();
  const { user, loading } = useAuth();

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (productiveRef.current && !productiveRef.current.contains(e.target as Node)) {
        setProductiveOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const links = [
    { name: "FINANCIAL CALCULATORS", href: "/calculators" },
    { name: "TAX TOOLS", href: "/tax-tools" },
    { name: "PRODUCTIVE TOOLS", href: "/tools", dropdown: true },
    { name: "CAREER TOOLS", href: "/career-tools" },
    { name: "GUIDES", href: "/guides" },
    { name: "LEARN", href: "/learn" },
    { name: "WHAT IF", href: "/what-if" },
  ];

  const productiveItems = [
    {
      label: "Invoice Generator",
      desc: "Professional invoices + payments",
      href: "/tools/invoice",
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      label: "eSign Tool",
      desc: "Sign documents free — up to 5 parties",
      href: "/tools/esign",
      icon: <FileSignature className="w-4 h-4" />,
      badge: "NEW",
    },
    {
      label: "All Productive Tools",
      desc: "Browse the full catalog",
      href: "/tools",
      icon: null,
    },
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
            {links.map((link) =>
              link.dropdown ? (
                <div key={link.href} className="relative" ref={productiveRef}>
                  <button
                    onClick={() => setProductiveOpen(!productiveOpen)}
                    data-testid="nav-productive-tools-toggle"
                    className={`flex items-center gap-1 transition-colors hover:text-[#f5c542] ${
                      location.startsWith(link.href) || productiveOpen ? "text-[#f5c542]" : "text-white/80"
                    }`}
                  >
                    {link.name}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${productiveOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {productiveOpen && (
                    <div
                      data-testid="nav-productive-dropdown"
                      className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                    >
                      {productiveItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          data-testid={`nav-dropdown-${item.href.replace(/\//g, "-")}`}
                          onClick={() => setProductiveOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-stone-50 group"
                        >
                          {item.icon && (
                            <div className="w-8 h-8 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                              {item.icon}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-stone-900 group-hover:text-teal-700">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-bold tracking-wider bg-teal-600 text-white px-1.5 py-0.5 rounded">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-500 mt-0.5">{item.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-[#f5c542] ${
                    location.startsWith(link.href) ? "text-[#f5c542]" : "text-white/80"
                  }`}
                >
                  {link.name}
                </Link>
              )
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!loading && (
            user ? (
              <Link
                href="/account"
                className="hidden md:inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 rounded-full px-4 py-2 text-sm font-bold transition-colors"
                data-testid="nav-account-link"
              >
                <UserCircle className="w-4 h-4" />
                {user.name.split(" ")[0]}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 rounded-full px-5 py-2 text-sm font-bold transition-colors"
                data-testid="nav-login-link"
              >
                Sign In
              </Link>
            )
          )}
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
            href="/tools/esign"
            className="block text-sm font-semibold text-[#f5c542] py-2"
            onClick={() => setIsOpen(false)}
          >
            ↳ eSign Tool <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded ml-1">NEW</span>
          </Link>
          {!loading && (
            user ? (
              <Link
                href="/account"
                className="block text-sm font-semibold text-white/80 hover:text-[#f5c542] py-2"
                onClick={() => setIsOpen(false)}
              >
                My Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="block text-sm font-semibold text-white/80 hover:text-[#f5c542] py-2"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            )
          )}
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
