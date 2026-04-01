import React from "react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <Seo title="Contact Us" description="Get in touch with RealProfits" />
      <h1 className="font-serif text-4xl font-bold mb-8">Contact Us</h1>
      
      <div className="bg-card border rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">We'd love to hear from you</h2>
        <p className="text-muted-foreground mb-8">Have a question about a calculator? Want to share your financial story? Drop us a line.</p>
        
        <form className="space-y-6" onSubmit={e => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <input type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Jane" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <input type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Doe" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="jane@example.com" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <textarea className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[150px]" placeholder="How can we help?"></textarea>
          </div>
          
          <Button size="lg" className="w-full md:w-auto">Send Message</Button>
        </form>
      </div>
    </div>
  );
}
