"use client";
import React from "react";
import { Seo } from "@/components/Seo";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <Seo title="About Us" description="RealProfits was built on a simple belief: money shouldn't be confusing, stressful, or locked behind paywalls. Free financial tools, guides, and calculators for everyday Americans." keywords="about RealProfits, personal finance website, financial education, money management, free financial tools, USA finance" path="/about" />

      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">About RealProfits</h1>

      <div className="prose prose-lg prose-headings:font-serif max-w-none">
        <p className="text-xl text-muted-foreground italic mb-8">RealProfits was built on a simple belief:</p>

        <p className="text-xl font-semibold mb-8">Money shouldn't be confusing, stressful, or locked behind paywalls.</p>

        <p>For most people, financial decisions aren't about maximizing returns or chasing trends. They're about everyday realities -- paying bills, managing income, avoiding debt, and trying to build a little stability over time.</p>

        <p>But the tools meant to help are often expensive, complicated, or designed to sell more than they solve.</p>

        <p className="font-semibold">We're here to change that.</p>

        <hr className="my-10 border-border" />

        <h3>Why This Exists</h3>

        <p>RealProfits exists to make financial clarity accessible to everyone.</p>

        <p>
          Not just people who can afford subscriptions.<br />
          Not just people who understand financial jargon.<br />
          But anyone trying to make better decisions with their money.
        </p>

        <p>We believe that basic financial tools -- understanding your income, calculating your taxes, tracking expenses, creating invoices -- should be freely available, simple to use, and genuinely helpful.</p>

        <hr className="my-10 border-border" />

        <h3>What We're Building</h3>

        <p>RealProfits brings together:</p>

        <ul>
          <li><strong>Clear Guides</strong><br />Calm, straightforward explanations of real financial topics -- without noise or pressure.</li>
          <li><strong>Practical Calculators</strong><br />Tools that help you understand your numbers instantly and make decisions with confidence.</li>
          <li><strong>Free Utility Tools</strong><br />Features people often pay for elsewhere -- built here to be accessible, fast, and free.</li>
        </ul>

        <hr className="my-10 border-border" />

        <h3>A Human Approach to Money</h3>

        <p>This platform is not built around selling financial products.</p>

        <p>It's built around helping people:</p>
        <ul>
          <li>feel less overwhelmed</li>
          <li>understand their situation</li>
          <li>make small, meaningful improvements</li>
        </ul>

        <p>Because for most people, progress doesn't come from complex strategies.<br />It comes from clarity.</p>

        <hr className="my-10 border-border" />

        <h3>Giving Back</h3>

        <p>RealProfits is also built with a broader intention.</p>

        <p>A portion of what this platform generates -- whether through ads or future products -- is committed toward meaningful causes, including:</p>
        <ul>
          <li>education support</li>
          <li>food and basic needs</li>
          <li>community welfare</li>
        </ul>

        <p>The goal is simple:<br />If knowledge can improve lives, it should also contribute back to society.</p>

        <hr className="my-10 border-border" />

        <h3>What You'll Find Here</h3>

        <ul>
          <li>Answers to everyday financial questions</li>
          <li>Tools to calculate, plan, and understand your money</li>
          <li>A space that respects your time and attention</li>
        </ul>

        <p>No pressure. No confusion. No unnecessary complexity.</p>

        <hr className="my-10 border-border" />

        <h3>Stay Ahead With RealProfits</h3>

        <p className="font-semibold">Simple tools. Clear thinking. Better decisions -- one step at a time.</p>
      </div>
    </div>
  );
}
