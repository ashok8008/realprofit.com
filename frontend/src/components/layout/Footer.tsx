"use client";
import { useState } from "react";
import Link from "next/link";

import { saveToStorage, loadFromStorage } from "@/lib/career-tools/storage";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const existing = loadFromStorage<string[]>("newsletter_subscribers", []);
    if (!existing.includes(email.trim().toLowerCase())) {
      existing.push(email.trim().toLowerCase());
      saveToStorage("newsletter_subscribers", existing);
    }
    setSubscribed(true);
    setEmail("");
  };

  return (
    <>
      <section className="bg-[#042f2e] py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-white text-center">Stay Ahead With RealProfits</h2>
          <p className="text-white/60 mb-8 text-center max-w-xl mx-auto text-sm">
            Get practical insights, new tools, and smarter ways to think about money, work, and your future.
          </p>
          {subscribed ? (
            <div className="text-center">
              <p className="text-[#f5c542] font-bold text-lg mb-2">Thank you for subscribing!</p>
              <p className="text-white/70 text-sm">You'll receive our latest tips and insights.</p>
            </div>
          ) : (
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={handleSubscribe}>
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter Email Address" 
                className="flex h-12 w-full rounded-md bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f5c542]"
                required
              />
              <button type="submit" className="inline-flex h-12 items-center justify-center rounded-md bg-[#f5c542] text-gray-900 px-8 text-sm font-bold shadow transition-colors hover:bg-[#e5b732] whitespace-nowrap">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="bg-[#111827] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
            <div>
              <Link href="/" className="flex items-center mb-4">
                <span className="font-serif font-bold text-2xl text-white">RealProfits<span className="text-[#f5c542]">.</span></span>
              </Link>
            </div>
            
            <div>
              <h3 className="font-bold mb-5 text-sm text-white">Quick Links</h3>
              <ul className="space-y-3 text-white/60 text-sm">
                <li><Link href="/calculators" className="hover:text-white transition-colors">Financial Calculators</Link></li>
                <li><Link href="/tools" className="hover:text-white transition-colors">Productive Tools</Link></li>
                <li><Link href="/career-tools" className="hover:text-white transition-colors">Career Tools</Link></li>
                <li><Link href="/guides" className="hover:text-white transition-colors">Financial Guides</Link></li>
                <li><Link href="/what-if" className="hover:text-white transition-colors">What-If Simulator</Link></li>
                <li><Link href="/search" className="hover:text-white transition-colors">Articles</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-5 text-sm text-white">Legal</h3>
              <ul className="space-y-3 text-white/60 text-sm">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-5 text-sm text-white">Contact</h3>
              <ul className="space-y-3 text-white/60 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#f5c542] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  (406) 555-0120
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#f5c542] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <a href="mailto:realprofits@gmail.com" className="hover:text-white transition-colors">realprofits@gmail.com</a>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#f5c542] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  2972 Westheimer Rd. Santa Ana, Illinois 85486
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-5 text-sm text-white">Social Media</h3>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer" aria-label="Facebook">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer" aria-label="Twitter">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer" aria-label="LinkedIn">
                  <span className="text-white text-xs font-bold">in</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer" aria-label="Instagram">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/40 text-sm">&copy; {new Date().getFullYear()} RealProfits. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
