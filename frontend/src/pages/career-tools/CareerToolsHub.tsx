import React from "react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { careerTools, careerToolCategories } from "@/data/career-tools";
import { 
  ArrowRight, FileText, Mail, DollarSign, AlertCircle, 
  CheckSquare, Target, Briefcase, Clock, Users, Shield,
  Calculator, BookOpen, TrendingUp
} from "lucide-react";

const toolIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  "resume-builder": { icon: <FileText className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
  "cover-letter-generator": { icon: <Mail className="w-5 h-5" />, color: "bg-violet-100 text-violet-600" },
  "salary-comparison": { icon: <DollarSign className="w-5 h-5" />, color: "bg-emerald-100 text-emerald-600" },
  "am-i-underpaid": { icon: <AlertCircle className="w-5 h-5" />, color: "bg-amber-100 text-amber-600" },
  "resume-score": { icon: <CheckSquare className="w-5 h-5" />, color: "bg-rose-100 text-rose-600" },
  "job-readiness-score": { icon: <Target className="w-5 h-5" />, color: "bg-teal-100 text-teal-600" },
  "offer-comparison": { icon: <Briefcase className="w-5 h-5" />, color: "bg-cyan-100 text-cyan-600" },
  "salary-negotiation": { icon: <TrendingUp className="w-5 h-5" />, color: "bg-indigo-100 text-indigo-600" },
  "interview-prep": { icon: <Users className="w-5 h-5" />, color: "bg-pink-100 text-pink-600" },
  "email-templates": { icon: <Mail className="w-5 h-5" />, color: "bg-orange-100 text-orange-600" },
};

export default function CareerToolsHub() {
  const activeTools = careerTools.filter(t => t.status === 'active');
  const comingSoonTools = careerTools.filter(t => t.status === 'coming-soon');
  
  return (
    <div className="w-full">
      <Seo 
        title="Career Tools - Free Resume Builder, Salary Comparison & More"
        description="Free career tools to help you build resumes, generate cover letters, compare salaries, and assess your job readiness. No signup required."
        keywords="resume builder, cover letter generator, salary comparison, am i underpaid, resume score, job readiness, career tools, free career tools, job search tools"
        path="/career-tools"
      />
      
      {/* Hero Section */}
      <section className="hero-gradient py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-4">
                <span className="text-xs font-bold text-white">100% FREE</span>
                <span className="text-xs text-white/80">No signup required</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Career Tools That Help You Succeed
              </h1>
              <p className="text-base text-white/80 mb-6 max-w-md leading-relaxed">
                Build resumes, generate cover letters, compare salaries, and assess your job readiness — all free, all in your browser, all private.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="#all-tools" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-full px-7 py-3 font-bold text-sm transition-colors inline-block shadow-lg">
                  Explore All Tools
                </Link>
                <Link href="/career-tools/resume-builder" className="bg-white/10 text-white hover:bg-white/20 border border-white/30 rounded-full px-7 py-3 font-bold text-sm transition-colors inline-block">
                  Build Resume
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative h-[350px] hidden lg:block">
              <div className="absolute top-0 right-16 bg-white rounded-xl p-4 shadow-2xl rotate-3 w-56 z-20">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Resume Builder</div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  <div className="mt-2 pt-2 border-t">
                    <div className="h-2 bg-teal-200 rounded w-1/2 mb-1"></div>
                    <div className="h-1.5 bg-gray-100 rounded w-full"></div>
                    <div className="h-1.5 bg-gray-100 rounded w-4/5 mt-1"></div>
                  </div>
                </div>
                <div className="mt-3 flex gap-1">
                  {['bg-blue-100', 'bg-emerald-100', 'bg-amber-100'].map((c, i) => (
                    <span key={i} className={`${c} text-[8px] px-2 py-0.5 rounded-full`}>Skill</span>
                  ))}
                </div>
              </div>
              
              <div className="absolute top-28 right-0 bg-white rounded-xl p-4 shadow-2xl -rotate-2 w-48 z-30">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Salary Check</div>
                <div className="text-2xl font-bold text-gray-900">$95,000</div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">Above Average</div>
              </div>
              
              <div className="absolute bottom-4 right-20 bg-white rounded-xl p-4 shadow-2xl rotate-2 w-52 z-10">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Job Readiness</div>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14">
                    <svg className="w-14 h-14 transform -rotate-90">
                      <circle cx="28" cy="28" r="24" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                      <circle cx="28" cy="28" r="24" stroke="#14b8a6" strokeWidth="4" fill="none" 
                        strokeDasharray={`${78 * 2 * Math.PI / 100 * 150} ${150}`} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">78%</span>
                  </div>
                  <div className="text-[10px] text-gray-600">
                    <div className="flex items-center gap-1"><CheckSquare className="w-3 h-3 text-emerald-500" /> Resume</div>
                    <div className="flex items-center gap-1"><CheckSquare className="w-3 h-3 text-emerald-500" /> Skills</div>
                    <div className="flex items-center gap-1 text-amber-600"><AlertCircle className="w-3 h-3" /> LinkedIn</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="py-16 bg-gray-50 border-b">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold mb-3">Most Popular Career Tools</h2>
            <p className="text-gray-500">Start with these essentials for your job search</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTools.slice(0, 3).map(tool => {
              const iconData = toolIcons[tool.id];
              return (
                <Link key={tool.slug} href={`/career-tools/${tool.slug}`} className="group">
                  <div className="bg-white border rounded-xl p-6 h-full shadow-sm hover:shadow-lg transition-all hover:border-teal-400 hover:-translate-y-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconData?.color || 'bg-gray-100'}`}>
                      {iconData?.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-teal-600 transition-colors">{tool.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{tool.description}</p>
                    <span className="text-teal-600 font-bold text-sm flex items-center">
                      Use Tool <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-gray-500">Simple, fast, and completely free</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <FileText className="w-6 h-6" />, title: "Choose a Tool", desc: "Pick from resume builder, salary tools, or assessments" },
              { icon: <Clock className="w-6 h-6" />, title: "Enter Your Info", desc: "Fill in your details — everything stays in your browser" },
              { icon: <CheckSquare className="w-6 h-6" />, title: "Get Results", desc: "See instant results, scores, or generated content" },
              { icon: <Target className="w-6 h-6" />, title: "Download & Use", desc: "Export as PDF or copy to use anywhere" },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Tools */}
      <div id="all-tools" className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">All Career Tools</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Everything you need for your job search and career planning.</p>
        </div>

        {careerToolCategories.map(cat => {
          const catTools = activeTools.filter(t => t.category === cat.id);
          if (catTools.length === 0) return null;
          
          return (
            <div key={cat.id} className="mb-14 last:mb-0">
              <h3 className="font-serif text-2xl font-bold mb-6 border-b pb-3">{cat.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {catTools.map(tool => {
                  const iconData = toolIcons[tool.id] || { icon: <Briefcase className="w-5 h-5" />, color: "bg-gray-100 text-gray-600" };
                  return (
                    <Link key={tool.slug} href={`/career-tools/${tool.slug}`} className="group h-full block">
                      <div className="bg-white border rounded-xl p-5 h-full shadow-sm hover:shadow-md transition-all hover:border-teal-400 flex flex-col">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconData.color}`}>
                            {iconData.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm mb-1 group-hover:text-teal-600 transition-colors">{tool.name}</h4>
                            <p className="text-gray-500 text-xs line-clamp-2">{tool.description}</p>
                          </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-50">
                          <span className="text-teal-600 font-bold text-xs flex items-center">
                            Use Tool <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Coming Soon */}
        {comingSoonTools.length > 0 && (
          <div className="mt-14">
            <h3 className="font-serif text-2xl font-bold mb-6 border-b pb-3 text-gray-400">Coming Soon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {comingSoonTools.map(tool => {
                const iconData = toolIcons[tool.id] || { icon: <Briefcase className="w-5 h-5" />, color: "bg-gray-100 text-gray-400" };
                return (
                  <div key={tool.slug} className="bg-gray-50 border border-dashed rounded-xl p-5 opacity-60">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-400`}>
                        {iconData.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm mb-1 text-gray-500">{tool.name}</h4>
                        <p className="text-gray-400 text-xs">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Why People Use These Tools */}
      <section className="py-16 bg-gray-50 border-t">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-3">Why People Use These Tools</h2>
            <p className="text-gray-500">Built for real job seekers with real needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="w-6 h-6" />, title: "100% Private", desc: "Your data never leaves your browser. No accounts, no tracking, no selling your info." },
              { icon: <Clock className="w-6 h-6" />, title: "Save Time", desc: "Create professional documents in minutes instead of hours. Focus on your job search." },
              { icon: <Users className="w-6 h-6" />, title: "Data-Driven", desc: "Get salary insights based on market data. Know your worth before negotiating." },
            ].map((item, i) => (
              <div key={i} className="bg-white border rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-3">Related Resources</h2>
            <p className="text-gray-500">More tools and guides to help your career</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/calculators/salary-calculator" className="group block bg-white border rounded-xl p-6 hover:shadow-lg transition-all hover:border-teal-400">
              <Calculator className="w-8 h-8 text-teal-600 mb-3" />
              <h3 className="font-bold mb-2 group-hover:text-teal-600">Salary Calculators</h3>
              <p className="text-gray-500 text-sm">Calculate take-home pay, taxes, and more</p>
            </Link>
            <Link href="/tools/paycheck-calculator" className="group block bg-white border rounded-xl p-6 hover:shadow-lg transition-all hover:border-teal-400">
              <DollarSign className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="font-bold mb-2 group-hover:text-teal-600">Paycheck Calculator</h3>
              <p className="text-gray-500 text-sm">Estimate your take-home pay from gross income</p>
            </Link>
            <Link href="/guides" className="group block bg-white border rounded-xl p-6 hover:shadow-lg transition-all hover:border-teal-400">
              <BookOpen className="w-8 h-8 text-violet-600 mb-3" />
              <h3 className="font-bold mb-2 group-hover:text-teal-600">Salary Guides</h3>
              <p className="text-gray-500 text-sm">Explore salary data by role and location</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#0d9488] via-[#0ea5a5] to-[#14b8c2]">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-serif text-3xl font-bold mb-4 text-white">Ready to Boost Your Career?</h2>
          <p className="text-white/80 mb-6">Start with our most popular tool — build a professional resume in minutes.</p>
          <Link href="/career-tools/resume-builder" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-full px-8 py-3 font-bold text-sm transition-colors inline-block shadow-lg">
            Start Building Your Resume
          </Link>
        </div>
      </section>
    </div>
  );
}
