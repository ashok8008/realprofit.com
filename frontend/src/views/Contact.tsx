"use client";
import React, { useState } from "react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const isValid = form.firstName.trim() && form.email.trim() && form.message.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const subject = encodeURIComponent(`Contact from ${form.firstName} ${form.lastName}`.trim());
    const body = encodeURIComponent(`Name: ${form.firstName} ${form.lastName}\nEmail: ${form.email}\n\n${form.message}`);
    window.open(`mailto:realprofits@gmail.com?subject=${subject}&body=${body}`, "_self");

    setSubmitted(true);
    toast({ title: "Message Prepared", description: "Your email client should open with the message. You can also email us directly at realprofits@gmail.com." });
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <Seo title="Contact Us" description="Get in touch with the RealProfits team. Questions, feedback, or partnership inquiries welcome." keywords="contact RealProfits, financial website contact, personal finance help, feedback" path="/contact" />
      <h1 className="font-serif text-4xl font-bold mb-8">Contact Us</h1>
      
      <div className="bg-card border rounded-xl p-8 shadow-sm">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <h2 className="text-2xl font-bold">Thank you for reaching out!</h2>
            <p className="text-muted-foreground">Your email client should have opened with your message pre-filled. If it didn't, you can email us directly at:</p>
            <a href="mailto:realprofits@gmail.com" className="text-primary font-bold text-lg hover:underline">realprofits@gmail.com</a>
            <div className="pt-4">
              <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ firstName: "", lastName: "", email: "", message: "" }); }}>
                Send Another Message
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">We'd love to hear from you</h2>
            <p className="text-muted-foreground mb-8">Have a question about a calculator? Want to share your financial story? Drop us a line.</p>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name <span className="text-destructive">*</span></label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => setForm({...form, firstName: e.target.value})}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="Jane"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => setForm({...form, lastName: e.target.value})}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address <span className="text-destructive">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="jane@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Message <span className="text-destructive">*</span></label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[150px]"
                  placeholder="How can we help?"
                  required
                ></textarea>
              </div>
              
              <Button size="lg" className="w-full md:w-auto" type="submit" disabled={!isValid}>Send Message</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
