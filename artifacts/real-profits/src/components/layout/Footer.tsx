import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link href="/" className="font-serif font-bold text-2xl tracking-tight block mb-4">
              RealProfits.
            </Link>
            <p className="text-primary-foreground/80 max-w-sm">
              Practical money clarity for everyday life. No hype, just grounded advice to help you navigate your finances.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg">Categories</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link href="/category/money-basics" className="hover:underline">Money Basics</Link></li>
              <li><Link href="/category/income-side-hustles" className="hover:underline">Income & Side Hustles</Link></li>
              <li><Link href="/category/taxes" className="hover:underline">Taxes</Link></li>
              <li><Link href="/category/saving-vs-investing" className="hover:underline">Saving vs Investing</Link></li>
              <li><Link href="/calculators" className="hover:underline">Calculators</Link></li>
              <li><Link href="/tools" className="hover:underline">Tools</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg">Company</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link href="/about" className="hover:underline">About Us</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
              <li><Link href="/editorial-policy" className="hover:underline">Editorial Policy</Link></li>
              <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="hover:underline">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} RealProfits. All rights reserved.</p>
          <p className="mt-2 md:mt-0 text-xs text-center md:text-right max-w-2xl">
            RealProfits provides educational content and tools. We do not provide personalized financial, legal, or tax advice. Always consult a qualified professional before making major financial decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
