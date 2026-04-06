from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="RealProfits API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Models
# ============================================================

class BulletPointRequest(BaseModel):
    bullet_point: str
    job_title: Optional[str] = None
    context: Optional[str] = None

class BulletPointResponse(BaseModel):
    original: str
    improved: str
    suggestions: List[str]

class SummaryRequest(BaseModel):
    current_summary: str
    job_title: Optional[str] = None
    years_experience: Optional[int] = None
    skills: Optional[List[str]] = None

class SummaryResponse(BaseModel):
    original: str
    improved: str
    word_count: int

class EmailTemplateRequest(BaseModel):
    template_type: str  # 'thank_you', 'follow_up', 'negotiation', 'decline'
    company_name: str
    job_title: str
    interviewer_name: Optional[str] = None
    interview_date: Optional[str] = None
    specific_points: Optional[str] = None

class EmailTemplateResponse(BaseModel):
    subject: str
    body: str
    template_type: str

# ============================================================
# AI Helper
# ============================================================

async def get_ai_response(system_message: str, user_message: str) -> str:
    """Get AI response using Emergent LLM"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"career-tools-{os.urandom(8).hex()}",
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")
        
        message = UserMessage(text=user_message)
        response = await chat.send_message(message)
        return response
    except ImportError:
        raise HTTPException(status_code=500, detail="LLM integration not available")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# Endpoints
# ============================================================

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "RealProfits API is running"}

@app.post("/api/career-tools/improve-bullet", response_model=BulletPointResponse)
async def improve_bullet_point(request: BulletPointRequest):
    """Improve a resume bullet point using AI"""
    
    system_msg = "Expert resume writer. Improve bullet points: strong action verb, quantified results, under 20 words, past tense. Return ONLY the improved bullet on line 1, then 3 tips (one per line)."
    
    user_msg = f'Improve: "{request.bullet_point}"'
    if request.job_title:
        user_msg += f' (Role: {request.job_title})'
    user_msg += '\nFormat: Line 1 = improved bullet. Lines 2-4 = 3 short tips.'
    
    response = await get_ai_response(system_msg, user_msg)
    lines = [l.strip() for l in response.strip().split('\n') if l.strip()]
    
    improved = lines[0].strip('"').strip() if lines else request.bullet_point
    suggestions = [l.lstrip('0123456789.-) ') for l in lines[1:4]]
    
    return BulletPointResponse(
        original=request.bullet_point,
        improved=improved,
        suggestions=suggestions
    )

@app.post("/api/career-tools/improve-summary", response_model=SummaryResponse)
async def improve_summary(request: SummaryRequest):
    """Improve a professional summary using AI"""
    
    system_msg = "Expert resume writer. Rewrite summaries: 50-80 words, active voice, strong identity statement, key achievements. No first person 'I'. Return ONLY the improved summary."
    
    skills_text = ', '.join(request.skills[:5]) if request.skills else ''
    user_msg = f'Rewrite: "{request.current_summary}"'
    if request.job_title:
        user_msg += f' Role: {request.job_title}.'
    if skills_text:
        user_msg += f' Skills: {skills_text}.'
    
    improved = await get_ai_response(system_msg, user_msg)
    improved_text = improved.strip().strip('"')
    
    return SummaryResponse(
        original=request.current_summary,
        improved=improved_text,
        word_count=len(improved_text.split())
    )

@app.post("/api/career-tools/email-template", response_model=EmailTemplateResponse)
async def generate_email_template(request: EmailTemplateRequest):
    """Generate professional email using AI"""
    
    type_label = request.template_type.replace('_', ' ')
    system_msg = f"Write a professional {type_label} email. Under 150 words. Format: SUBJECT: [line]\\nBODY:\\n[email]. Sign as [Your Name]."
    
    user_msg = f"{type_label} for {request.job_title} at {request.company_name}."
    if request.interviewer_name:
        user_msg += f" To: {request.interviewer_name}."
    if request.interview_date:
        user_msg += f" Date: {request.interview_date}."
    if request.specific_points:
        user_msg += f" Mention: {request.specific_points}."
    
    response = await get_ai_response(system_msg, user_msg)
    
    lines = response.strip().split('\n')
    subject = ""
    body_lines = []
    in_body = False
    for line in lines:
        if line.upper().startswith('SUBJECT:'):
            subject = line.split(':', 1)[1].strip()
        elif line.upper().startswith('BODY:'):
            in_body = True
        elif in_body:
            body_lines.append(line)
    
    if not subject:
        subject = f"Re: {request.job_title} at {request.company_name}"
    body = '\n'.join(body_lines).strip() or response
    
    return EmailTemplateResponse(subject=subject, body=body, template_type=request.template_type)

@app.get("/api/career-tools/email-templates")
async def list_email_templates():
    """List available email template types"""
    return {
        "templates": [
            {"type": "thank_you", "name": "Thank You Email", "description": "Send after an interview"},
            {"type": "follow_up", "name": "Follow Up Email", "description": "Check on application status"},
            {"type": "negotiation", "name": "Negotiation Email", "description": "Negotiate salary or terms"},
            {"type": "decline", "name": "Decline Offer Email", "description": "Politely decline an offer"},
            {"type": "accept", "name": "Accept Offer Email", "description": "Accept a job offer"}
        ]
    }


# ============================================================
# Dynamic Sitemap
# ============================================================

@app.get("/api/sitemap.xml")
async def dynamic_sitemap():
    today = date.today().isoformat()

    # Static pages
    static_pages = [
        ("/", "1.0", "weekly"),
        ("/calculators", "0.9", "weekly"),
        ("/tools", "0.9", "weekly"),
        ("/guides", "0.9", "weekly"),
        ("/career-tools", "0.9", "weekly"),
        ("/what-if", "0.8", "monthly"),
        ("/search", "0.7", "weekly"),
        ("/about", "0.5", "monthly"),
        ("/contact", "0.4", "yearly"),
        ("/privacy", "0.3", "yearly"),
        ("/terms", "0.3", "yearly"),
        ("/disclaimer", "0.3", "yearly"),
        ("/editorial-policy", "0.3", "yearly"),
    ]

    # Categories
    categories = [
        "money-basics", "income-side-hustles", "taxes", "saving-vs-investing",
        "debt-credit", "life-decisions", "real-stories", "calculators",
    ]

    # Calculators
    calculator_slugs = [
        "savings-goal-calculator", "emergency-fund-calculator", "monthly-budget-calculator",
        "expense-breakdown-tool", "monthly-income-estimator", "side-hustle-earnings",
        "hourly-rate-calculator", "simple-tax-estimator", "tax-set-aside-calculator",
        "quarterly-tax-calculator", "self-employment-tax-calculator", "save-vs-invest-calculator",
        "compound-interest-calculator", "investment-growth-calculator", "credit-card-payoff-calculator",
        "loan-interest-calculator", "debt-snowball-calculator", "rent-vs-buy-calculator",
        "cost-of-living-comparison", "salary-reality-calculator", "simple-savings-calculator",
        "monthly-savings-calculator", "savings-income-calculator", "mortgage-calculator",
        "mortgage-amortization-calculator", "personal-loan-calculator", "auto-loan-calculator",
        "business-loan-calculator", "loan-affordability-calculator", "extra-payment-calculator",
        "investment-return-calculator", "sip-calculator", "retirement-growth-calculator",
        "debt-avalanche-calculator", "interest-calculator", "minimum-payment-trap-calculator",
        "profit-margin-calculator", "net-income-calculator", "can-i-afford-this-calculator",
    ]

    # Tools
    tool_slugs = [
        "freelance-invoice-generator", "subscription-cost-analyzer", "bill-split-tool",
        "net-worth-calculator", "paycheck-calculator", "income-tracker", "expense-tracker",
    ]

    # Career tools
    career_slugs = [
        "career-tools/resume-builder", "career-tools/cover-letter-generator",
        "career-tools/salary-comparison", "career-tools/am-i-underpaid",
        "career-tools/resume-score", "career-tools/job-readiness-score",
        "career-tools/offer-comparison", "career-tools/salary-negotiation",
        "career-tools/interview-prep", "career-tools/email-templates",
    ]

    # ─── pSEO Guide Slugs (generated dynamically) ───

    # Salary: 20k→100k step 5k, 100k→300k step 10k + legacy
    salary_grid = list(range(20000, 105000, 5000)) + list(range(110000, 310000, 10000))
    salary_legacy = [42000, 48000, 52000, 58000, 62000, 68000, 72000, 78000, 82000, 88000,
                     92000, 98000, 105000, 115000, 125000, 135000, 145000, 175000, 225000,
                     275000, 350000, 400000, 500000]
    salary_amounts = sorted(set(salary_grid + salary_legacy))

    # Tax: same range
    tax_amounts = salary_amounts

    # Savings
    savings_grid = list(range(1000, 6000, 1000)) + list(range(10000, 55000, 5000)) + list(range(75000, 225000, 25000))
    savings_extra = [250000, 300000, 400000, 500000, 750000, 1000000]
    savings_legacy = [500, 1500, 2500, 3000, 4000, 6000, 7500, 8000, 12000, 60000]
    savings_amounts = sorted(set(savings_grid + savings_extra + savings_legacy))

    # Mortgage
    mortgage_amounts = [50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000,
                        450000, 500000, 600000, 700000, 800000, 900000, 1000000, 1500000, 2000000]
    mortgage_variant_amounts = [150000, 200000, 300000, 400000, 500000, 700000, 1000000, 1500000]
    mortgage_rates = [5, 6, 7, 8]
    mortgage_terms = [15, 30]

    # Debt
    debt_amounts = [1000, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000]

    # Freelancer
    freelancer_amounts = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 50000, 60000,
                          70000, 80000, 90000, 100000, 120000, 150000, 175000, 200000, 250000, 300000]

    # Location Salary
    location_salary_amounts = [30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000,
                               120000, 150000, 175000, 200000, 250000, 300000]
    city_slugs = [
        "new-york", "san-francisco", "los-angeles", "san-jose", "seattle",
        "boston", "washington-dc", "chicago", "miami", "denver",
        "austin", "dallas", "houston", "san-antonio", "nashville",
        "atlanta", "phoenix", "portland", "minneapolis", "philadelphia",
        "charlotte", "raleigh", "salt-lake-city", "pittsburgh", "tampa",
        "detroit", "kansas-city", "columbus", "san-diego", "las-vegas",
    ]

    # Articles (static list)
    article_slugs = [
        "build-emergency-fund-no-money", "freelance-taxes-reality", "hysa-vs-investing",
        "paid-off-student-loans-story", "rent-vs-buy-today", "how-much-money-saved-every-age",
        "why-saving-money-feels-harder", "living-paycheck-to-paycheck-today",
        "accidentally-overspend-without-realizing", "money-mistakes-in-your-20s",
        "money-mistakes-in-your-30s", "cash-keep-vs-invest", "healthy-monthly-budget-us",
        "dont-know-where-money-goes", "small-expenses-destroy-savings",
        "side-hustle-worth-it-2026", "realistic-side-hustle-earnings",
        "freelancers-struggle-irregular-income", "plan-finances-unpredictable-income",
        "wrong-about-passive-income", "calculate-true-hourly-rate",
        "side-hustle-become-real-business", "how-much-charge-freelancer",
        "more-income-not-more-savings", "stabilize-income-freelance",
        "freelancers-surprised-by-taxes", "tax-on-50000-income", "tax-on-100000-income",
        "miss-tax-deadline", "file-taxes-under-10000", "estimated-taxes-explained",
        "freelancers-set-aside-taxes", "tax-mistakes-first-time-freelancers",
        "tax-software-confusing", "dont-pay-taxes-for-year", "save-or-invest-first",
        "high-yield-savings-popular-again", "investing-too-risky-beginners",
        "compound-interest-real-life", "invest-500-every-month", "how-long-build-real-wealth",
        "timing-market-rarely-works", "dont-understand-about-investing",
        "how-much-invest-vs-save", "long-term-investing-beats-short-term",
        "credit-card-interest-explained", "minimum-payments-keep-in-debt",
        "how-long-pay-off-credit-card", "all-debt-bad-or-useful",
        "credit-score-means-real-life", "debt-grows-faster-than-expected",
        "real-cost-credit-card-debt", "decide-which-debt-pay-first",
        "stay-in-debt-good-income", "stop-paying-your-loans",
        "high-yield-savings-account-worth-it", "debt-snowball-vs-avalanche-strategy",
        "first-time-home-buyer-mortgage-guide", "retirement-planning-by-age",
    ]

    # ─── Build XML ───
    urls = []

    def add(path, priority, freq):
        urls.append(f'  <url>\n    <loc>https://realprofits.com{path}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>{freq}</changefreq>\n    <priority>{priority}</priority>\n  </url>')

    # Static
    for path, pri, freq in static_pages:
        add(path, pri, freq)

    # Categories
    for c in categories:
        add(f"/category/{c}", "0.7", "weekly")

    # Calculators
    for s in calculator_slugs:
        add(f"/calculators/{s}", "0.8", "monthly")

    # Tools
    for s in tool_slugs:
        add(f"/tools/{s}", "0.8", "monthly")

    # Career Tools
    for s in career_slugs:
        add(f"/{s}", "0.8", "monthly")

    # Guides: Salary
    for a in salary_amounts:
        add(f"/guides/{a}-salary", "0.6", "monthly")

    # Guides: Tax
    for a in tax_amounts:
        add(f"/guides/tax-on-{a}-income", "0.6", "monthly")

    # Guides: Savings
    for a in savings_amounts:
        add(f"/guides/save-{a}", "0.6", "monthly")

    # Guides: Mortgage (base)
    for a in mortgage_amounts:
        add(f"/guides/mortgage-{a}", "0.6", "monthly")

    # Guides: Mortgage (rate variants)
    for a in mortgage_variant_amounts:
        for r in mortgage_rates:
            add(f"/guides/mortgage-{a}-{r}-percent", "0.5", "monthly")

    # Guides: Mortgage (term variants)
    for a in mortgage_variant_amounts:
        for t in mortgage_terms:
            add(f"/guides/mortgage-{a}-{t}-year", "0.5", "monthly")

    # Guides: Debt
    for a in debt_amounts:
        add(f"/guides/pay-off-{a}-debt", "0.6", "monthly")
        add(f"/guides/credit-card-interest-{a}", "0.6", "monthly")

    # Guides: Freelancer
    for a in freelancer_amounts:
        add(f"/guides/self-employment-tax-{a}", "0.6", "monthly")
        add(f"/guides/how-much-tax-to-set-aside-{a}", "0.6", "monthly")

    # Guides: Location Salary
    for a in location_salary_amounts:
        for city in city_slugs:
            add(f"/guides/{a}-salary-in-{city}", "0.6", "monthly")

    # Articles
    for s in article_slugs:
        add(f"/articles/{s}", "0.7", "monthly")

    xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(urls) + '\n</urlset>'

    return Response(content=xml, media_type="application/xml")


@app.get("/api/sitemap/stats")
async def sitemap_stats():
    """Return page count stats for the pSEO system."""
    salary_count = len(set(list(range(20000, 105000, 5000)) + list(range(110000, 310000, 10000)) +
                        [42000, 48000, 52000, 58000, 62000, 68000, 72000, 78000, 82000, 88000,
                         92000, 98000, 105000, 115000, 125000, 135000, 145000, 175000, 225000,
                         275000, 350000, 400000, 500000]))
    tax_count = salary_count
    savings_count = len(set(list(range(1000, 6000, 1000)) + list(range(10000, 55000, 5000)) +
                         list(range(75000, 225000, 25000)) + [250000, 300000, 400000, 500000, 750000, 1000000] +
                         [500, 1500, 2500, 3000, 4000, 6000, 7500, 8000, 12000, 60000]))
    mortgage_base = 17
    mortgage_rate = 8 * 4
    mortgage_term = 8 * 2
    debt_count = 15 * 2
    freelancer_count = 19 * 2
    location_salary_count = 14 * 30  # 14 salary amounts × 30 cities

    total_guides = salary_count + tax_count + savings_count + mortgage_base + mortgage_rate + mortgage_term + debt_count + freelancer_count + location_salary_count

    return {
        "salary_guides": salary_count,
        "tax_guides": tax_count,
        "savings_guides": savings_count,
        "mortgage_guides": mortgage_base + mortgage_rate + mortgage_term,
        "debt_guides": debt_count,
        "freelancer_guides": freelancer_count,
        "location_salary_guides": location_salary_count,
        "total_guide_pages": total_guides,
        "total_sitemap_urls": total_guides + 13 + 8 + 38 + 7 + 10 + 59,
    }
