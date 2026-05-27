from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

from db import init_db
from auth import router as auth_router, seed_admin
from user_data import router as user_data_router
from invoices import router as invoices_router
from esign.routes import router as esign_router
from esign.database import init_esign_db
from billing.routes import router as billing_router
from billing.saved_signature import router as saved_sig_router
from scheduler_jobs import start_scheduler, stop_scheduler

app = FastAPI(title="RealProfits API")

# CORS — explicit origin for credential cookies, supports production via env
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
cors_origins = [frontend_url, "http://localhost:3000"]
extra_origins = os.environ.get("CORS_ORIGINS", "")
if extra_origins:
    cors_origins.extend([o.strip() for o in extra_origins.split(",") if o.strip()])
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(user_data_router)
app.include_router(invoices_router)
app.include_router(esign_router)
app.include_router(billing_router)
app.include_router(saved_sig_router)


@app.on_event("startup")
async def startup():
    await init_db()
    await seed_admin()
    try:
        await init_esign_db()
        print("[startup] eSign + Billing Postgres schema initialised")
    except Exception as e:
        print(f"[startup] eSign DB init failed: {e}")
    try:
        start_scheduler()
    except Exception as e:
        print(f"[startup] Scheduler start failed: {e}")


@app.on_event("shutdown")
async def shutdown():
    try:
        stop_scheduler()
    except Exception:
        pass

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

class GenerateSummariesRequest(BaseModel):
    job_title: Optional[str] = None
    years_experience: Optional[int] = None
    skills: Optional[List[str]] = None
    industry: Optional[str] = None

class GenerateSummariesResponse(BaseModel):
    summaries: List[str]

class SkillSuggestionsRequest(BaseModel):
    job_title: str
    current_skills: Optional[List[str]] = None

class SkillSuggestionsResponse(BaseModel):
    suggestions: List[str]

class ATSCheckRequest(BaseModel):
    personal_details: dict
    summary: str = ""
    experience: List[dict] = []
    education: List[dict] = []
    skills: List[str] = []
    certifications: List[str] = []
    job_description: Optional[str] = None

class ATSCheckCategory(BaseModel):
    name: str
    score: int
    max_score: int
    status: str
    issues: List[str]
    fixes: List[str]

class ATSCheckResponse(BaseModel):
    overall_score: int
    overall_status: str
    categories: List[ATSCheckCategory]
    keyword_analysis: dict
    summary_feedback: str

class ResumeDraftRequest(BaseModel):
    draft_id: str
    data: dict

class ResumeDraftResponse(BaseModel):
    draft_id: str
    data: dict
    updated_at: str

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
    lines = [line.strip() for line in response.strip().split('\n') if line.strip()]
    
    improved = lines[0].strip('"').strip() if lines else request.bullet_point
    suggestions = [line.lstrip('0123456789.-) ') for line in lines[1:4]]
    
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

@app.post("/api/career-tools/generate-summaries", response_model=GenerateSummariesResponse)
async def generate_summaries(request: GenerateSummariesRequest):
    """Generate 3 professional summary variations using AI"""
    
    system_msg = "Expert resume writer. Generate exactly 3 different professional summary options. Each should be 50-80 words, active voice, no first person 'I'. Separate each with ---."
    
    parts = []
    if request.job_title:
        parts.append(f"Role: {request.job_title}")
    if request.years_experience:
        parts.append(f"Experience: {request.years_experience} years")
    if request.skills:
        parts.append(f"Skills: {', '.join(request.skills[:8])}")
    if request.industry:
        parts.append(f"Industry: {request.industry}")
    
    user_msg = f"Generate 3 professional summary options. {'. '.join(parts)}.\nFormat: summary1\n---\nsummary2\n---\nsummary3"
    
    response = await get_ai_response(system_msg, user_msg)
    raw_summaries = [s.strip().strip('"') for s in response.split('---') if s.strip()]
    
    # Ensure we have exactly 3
    while len(raw_summaries) < 3:
        raw_summaries.append(raw_summaries[-1] if raw_summaries else "Professional with proven track record of delivering results.")
    
    return GenerateSummariesResponse(summaries=raw_summaries[:3])


@app.post("/api/career-tools/suggest-skills", response_model=SkillSuggestionsResponse)
async def suggest_skills(request: SkillSuggestionsRequest):
    """Suggest skills based on job title"""
    
    system_msg = "Return ONLY a comma-separated list of 15 professional skills relevant to the job title. No numbering, no explanation."
    
    user_msg = f"Skills for: {request.job_title}"
    if request.current_skills:
        user_msg += f". Already has: {', '.join(request.current_skills[:5])}. Suggest different ones."
    
    response = await get_ai_response(system_msg, user_msg)
    skills = [s.strip().strip('"').strip("'") for s in response.split(',') if s.strip()]
    
    # Filter out skills they already have
    if request.current_skills:
        existing = {s.lower() for s in request.current_skills}
        skills = [s for s in skills if s.lower() not in existing]
    
    return SkillSuggestionsResponse(suggestions=skills[:15])


# ── ATS Check helpers ──

ATS_SYSTEM_PROMPT = """You are an expert ATS (Applicant Tracking System) analyst. Analyze the resume for ATS compatibility and return a JSON response.

Evaluate these 5 categories (each scored out of 20, total 100):
1. "Keyword Match" - Are industry-relevant keywords present? If a job description is provided, compare against it.
2. "Format Safety" - Is the resume format ATS-parseable? (no tables, graphics, special chars, consistent formatting)
3. "Section Completeness" - Are all standard sections present? (Contact, Summary, Experience, Education, Skills)
4. "Contact Info" - Is contact information complete and professional? (name, email, phone, location, LinkedIn)
5. "Date Consistency" - Are dates formatted consistently? Are there unexplained gaps?

Return ONLY valid JSON (no markdown fences):
{
  "overall_score": <0-100>,
  "overall_status": "<Excellent|Strong|Good|Needs Work|Critical>",
  "categories": [
    {"name": "<category>", "score": <0-20>, "max_score": 20, "status": "<pass|warning|fail>", "issues": ["<issue1>"], "fixes": ["<fix1>"]}
  ],
  "keyword_analysis": {"found": ["<keyword1>"], "missing": ["<keyword1>"], "match_pct": <0-100>},
  "summary_feedback": "<2-3 sentence overall assessment>"
}"""


def _build_resume_text(request: ATSCheckRequest) -> str:
    """Convert structured resume data into plain text for AI analysis."""
    p = request.personal_details
    parts = [
        f"Name: {p.get('fullName', '')}",
        f"Email: {p.get('email', '')}",
        f"Phone: {p.get('phone', '')}",
        f"Location: {p.get('location', '')}",
        f"LinkedIn: {p.get('linkedin', '')}",
        f"Portfolio: {p.get('portfolio', '')}",
    ]
    if request.summary:
        parts.append(f"\nSummary: {request.summary}")
    for exp in request.experience:
        end = "Present" if exp.get("current") else exp.get("endDate", "")
        parts.append(f"\nExperience: {exp.get('title', '')} at {exp.get('company', '')} ({exp.get('startDate', '')} - {end})")
        if exp.get("description"):
            parts.append(exp["description"])
    for edu in request.education:
        parts.append(f"\nEducation: {edu.get('degree', '')} {edu.get('field', '')} at {edu.get('school', '')} ({edu.get('endDate', '')})")
    if request.skills:
        parts.append(f"\nSkills: {', '.join(request.skills)}")
    if request.certifications:
        parts.append(f"\nCertifications: {', '.join(request.certifications)}")
    return "\n".join(parts)


def _parse_ai_response(raw: str, fallback_skills: List[str]) -> dict:
    """Parse AI JSON response with fallback on failure."""
    import json
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "overall_score": 50,
            "overall_status": "Needs Work",
            "categories": [
                {"name": "Keyword Match", "score": 10, "max_score": 20, "status": "warning", "issues": ["Unable to perform detailed analysis"], "fixes": ["Add more industry-specific keywords"]},
                {"name": "Format Safety", "score": 15, "max_score": 20, "status": "pass", "issues": [], "fixes": []},
                {"name": "Section Completeness", "score": 10, "max_score": 20, "status": "warning", "issues": ["Some sections may be incomplete"], "fixes": ["Ensure all standard sections are filled"]},
                {"name": "Contact Info", "score": 10, "max_score": 20, "status": "warning", "issues": ["Review contact information"], "fixes": ["Ensure all contact fields are filled"]},
                {"name": "Date Consistency", "score": 5, "max_score": 20, "status": "warning", "issues": ["Review date formatting"], "fixes": ["Use consistent date formats"]},
            ],
            "keyword_analysis": {"found": fallback_skills[:5], "missing": [], "match_pct": 40},
            "summary_feedback": "Your resume needs improvements for better ATS compatibility.",
        }


def _normalize_ats_result(result_data: dict) -> dict:
    """Normalize AI result into validated ATSCheckResponse-compatible dict."""
    categories = []
    for cat in result_data.get("categories", []):
        categories.append(ATSCheckCategory(
            name=cat.get("name", "Unknown"),
            score=min(cat.get("score", 0), cat.get("max_score", 20)),
            max_score=cat.get("max_score", 20),
            status=cat.get("status", "warning"),
            issues=cat.get("issues", [])[:5],
            fixes=cat.get("fixes", [])[:5],
        ))
    kw = result_data.get("keyword_analysis", {})
    return {
        "overall_score": min(result_data.get("overall_score", 50), 100),
        "overall_status": result_data.get("overall_status", "Needs Work"),
        "categories": [c.dict() for c in categories],
        "keyword_analysis": {
            "found": kw.get("found", [])[:15],
            "missing": kw.get("missing", [])[:15],
            "match_pct": min(kw.get("match_pct", 0), 100),
        },
        "summary_feedback": result_data.get("summary_feedback", "Analysis complete."),
    }


@app.post("/api/career-tools/ats-check", response_model=ATSCheckResponse)
async def ats_check(request: ATSCheckRequest):
    """AI-powered ATS compatibility analysis with MongoDB caching."""
    import json
    import hashlib
    from datetime import datetime, timezone
    from db import get_db

    db = get_db()

    # Cache key
    resume_hash = hashlib.sha256(json.dumps({
        "p": request.personal_details,
        "s": request.summary,
        "e": [e.get("title", "") + e.get("company", "") for e in request.experience],
        "sk": sorted(request.skills),
        "jd": request.job_description or "",
    }, sort_keys=True).encode()).hexdigest()

    # Check cache (valid 1 hour)
    cached = await db.ats_checks.find_one({"hash": resume_hash}, {"_id": 0})
    if cached:
        cached_time = datetime.fromisoformat(cached["created_at"])
        if (datetime.now(timezone.utc) - cached_time).total_seconds() < 3600:
            return ATSCheckResponse(**cached["result"])

    # Build text and call AI
    resume_text = _build_resume_text(request)
    jd_section = f"\n\nJOB DESCRIPTION TO MATCH AGAINST:\n{request.job_description}" if request.job_description else ""
    user_msg = f"Analyze this resume for ATS compatibility:\n\n{resume_text}{jd_section}\n\nReturn ONLY the JSON response."

    response = await get_ai_response(ATS_SYSTEM_PROMPT, user_msg)
    result_data = _parse_ai_response(response, request.skills)
    result = _normalize_ats_result(result_data)

    # Cache to MongoDB
    await db.ats_checks.update_one(
        {"hash": resume_hash},
        {"$set": {"hash": resume_hash, "result": result, "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )

    return ATSCheckResponse(**result)


@app.post("/api/career-tools/resume-draft", response_model=ResumeDraftResponse)
async def save_resume_draft(request: ResumeDraftRequest):
    """Save resume draft to MongoDB"""
    from datetime import datetime, timezone
    from db import get_db
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()
    await db.resume_drafts.update_one(
        {"draft_id": request.draft_id},
        {"$set": {"data": request.data, "updated_at": now}},
        upsert=True
    )
    return ResumeDraftResponse(draft_id=request.draft_id, data=request.data, updated_at=now)


@app.get("/api/career-tools/resume-draft/{draft_id}")
async def get_resume_draft(draft_id: str):
    """Get resume draft from MongoDB"""
    from db import get_db
    db = get_db()
    doc = await db.resume_drafts.find_one({"draft_id": draft_id}, {"_id": 0})
    if not doc:
        return {"draft_id": draft_id, "data": None}
    return {"draft_id": doc["draft_id"], "data": doc["data"], "updated_at": doc.get("updated_at", "")}


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
# Tax Tools AI
# ============================================================

class TaxExplainRequest(BaseModel):
    prompt: str

class TaxExplainResponse(BaseModel):
    explanation: str

@app.post("/api/tax-tools/explain", response_model=TaxExplainResponse)
async def tax_explain(request: TaxExplainRequest):
    system = (
        "You are a friendly, plain-English tax educator. The user has just used a tax calculator on RealProfits.com. "
        "Explain their results in simple language. Highlight key insights and suggest practical improvements. "
        "Do NOT provide specific tax advice — always recommend consulting a tax professional for complex situations. "
        "Keep responses under 200 words. Use bullet points for clarity. "
        "IMPORTANT: This is informational only, not tax filing advice."
    )
    response = await get_ai_response(system, request.prompt)
    return TaxExplainResponse(explanation=response)


# ============================================================
# Sitemap Data & Helpers
# ============================================================

STATIC_PAGES = [
    ("/", "1.0", "weekly"),
    ("/calculators", "0.9", "weekly"),
    ("/tools", "0.9", "weekly"),
    ("/guides", "0.9", "weekly"),
    ("/career-tools", "0.9", "weekly"),
    ("/tax-tools", "0.9", "weekly"),
    ("/what-if", "0.8", "monthly"),
    ("/search", "0.7", "weekly"),
    ("/about", "0.5", "monthly"),
    ("/contact", "0.4", "yearly"),
    ("/privacy", "0.3", "yearly"),
    ("/terms", "0.3", "yearly"),
    ("/disclaimer", "0.3", "yearly"),
    ("/editorial-policy", "0.3", "yearly"),
]

CATEGORY_SLUGS = [
    "money-basics", "income-side-hustles", "taxes", "saving-vs-investing",
    "debt-credit", "life-decisions", "real-stories", "calculators",
]

CALCULATOR_SLUGS = [
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

TOOL_SLUGS = [
    "freelance-invoice-generator", "subscription-cost-analyzer", "bill-split-tool",
    "net-worth-calculator", "paycheck-calculator", "income-tracker", "expense-tracker",
]

CAREER_SLUGS = [
    "career-tools/resume-builder", "career-tools/cover-letter-generator",
    "career-tools/salary-comparison", "career-tools/am-i-underpaid",
    "career-tools/resume-score", "career-tools/job-readiness-score",
    "career-tools/offer-comparison", "career-tools/salary-negotiation",
    "career-tools/interview-prep", "career-tools/email-templates",
]

TAX_TOOL_SLUGS = [
    "tax-tools/freelancer-tax-planner", "tax-tools/income-mix-planner",
    "tax-tools/tax-checklist-generator", "tax-tools/1040es-prep-generator",
    "tax-tools/schedule-c-prep-summary", "tax-tools/tax-summary-pdf",
    "tax-tools/w2-1099-organizer", "tax-tools/year-end-tax-packet",
]

ARTICLE_SLUGS = [
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

CITY_SLUGS = [
    # Very High Cost
    "new-york", "san-francisco", "san-jose", "los-angeles", "san-diego",
    "honolulu", "orange-county",
    # High Cost
    "seattle", "boston", "washington-dc", "portland", "miami", "denver",
    "hartford", "sacramento", "stamford", "baltimore",
    # Moderate Cost
    "chicago", "atlanta", "minneapolis", "philadelphia", "austin", "dallas",
    "nashville", "salt-lake-city", "phoenix", "raleigh", "tampa", "las-vegas",
    "orlando", "jacksonville", "charlotte", "new-orleans", "richmond",
    "milwaukee", "boise",
    # Low Cost
    "houston", "san-antonio", "pittsburgh", "detroit", "kansas-city",
    "columbus", "cleveland", "cincinnati", "indianapolis", "st-louis",
    "memphis", "louisville", "oklahoma-city", "tucson", "el-paso",
    "omaha", "albuquerque", "birmingham", "buffalo", "des-moines",
]


def _get_salary_amounts():
    grid = list(range(20000, 105000, 5000)) + list(range(110000, 310000, 10000))
    legacy = [42000, 48000, 52000, 58000, 62000, 68000, 72000, 78000, 82000, 88000,
              92000, 98000, 105000, 115000, 125000, 135000, 145000, 175000, 225000,
              275000, 350000, 400000, 500000]
    return sorted(set(grid + legacy))


def _get_savings_amounts():
    grid = list(range(1000, 6000, 1000)) + list(range(10000, 55000, 5000)) + list(range(75000, 225000, 25000))
    extra = [250000, 300000, 400000, 500000, 750000, 1000000]
    legacy = [500, 1500, 2500, 3000, 4000, 6000, 7500, 8000, 12000, 60000]
    return sorted(set(grid + extra + legacy))


MORTGAGE_AMOUNTS = [50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000,
                    450000, 500000, 600000, 700000, 800000, 900000, 1000000, 1500000, 2000000]
MORTGAGE_VARIANT_AMOUNTS = [150000, 200000, 300000, 400000, 500000, 700000, 1000000, 1500000]
MORTGAGE_RATES = [5, 6, 7, 8]
MORTGAGE_TERMS = [15, 30]

DEBT_AMOUNTS = [1000, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000]

FREELANCER_AMOUNTS = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 50000, 60000,
                      70000, 80000, 90000, 100000, 120000, 150000, 175000, 200000, 250000, 300000]

LOCATION_SALARY_AMOUNTS = [30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000,
                           120000, 150000, 175000, 200000, 250000, 300000]


def _build_sitemap_url(domain: str, path: str, priority: str, freq: str, today: str) -> str:
    return (f'  <url>\n    <loc>{domain}{path}</loc>\n    <lastmod>{today}</lastmod>'
            f'\n    <changefreq>{freq}</changefreq>\n    <priority>{priority}</priority>\n  </url>')


def _build_guide_urls(domain: str, today: str) -> list[str]:
    """Generate all pSEO guide sitemap URLs."""
    urls = []
    salary_amounts = _get_salary_amounts()

    for a in salary_amounts:
        urls.append(_build_sitemap_url(domain, f"/guides/{a}-salary", "0.6", "monthly", today))

    for a in salary_amounts:
        urls.append(_build_sitemap_url(domain, f"/guides/tax-on-{a}-income", "0.6", "monthly", today))

    for a in _get_savings_amounts():
        urls.append(_build_sitemap_url(domain, f"/guides/save-{a}", "0.6", "monthly", today))

    for a in MORTGAGE_AMOUNTS:
        urls.append(_build_sitemap_url(domain, f"/guides/mortgage-{a}", "0.6", "monthly", today))

    for a in MORTGAGE_VARIANT_AMOUNTS:
        for r in MORTGAGE_RATES:
            urls.append(_build_sitemap_url(domain, f"/guides/mortgage-{a}-{r}-percent", "0.5", "monthly", today))
        for t in MORTGAGE_TERMS:
            urls.append(_build_sitemap_url(domain, f"/guides/mortgage-{a}-{t}-year", "0.5", "monthly", today))

    for a in DEBT_AMOUNTS:
        urls.append(_build_sitemap_url(domain, f"/guides/pay-off-{a}-debt", "0.6", "monthly", today))
        urls.append(_build_sitemap_url(domain, f"/guides/credit-card-interest-{a}", "0.6", "monthly", today))

    for a in FREELANCER_AMOUNTS:
        urls.append(_build_sitemap_url(domain, f"/guides/self-employment-tax-{a}", "0.6", "monthly", today))
        urls.append(_build_sitemap_url(domain, f"/guides/how-much-tax-to-set-aside-{a}", "0.6", "monthly", today))

    for a in LOCATION_SALARY_AMOUNTS:
        for city in CITY_SLUGS:
            urls.append(_build_sitemap_url(domain, f"/guides/{a}-salary-in-{city}", "0.6", "monthly", today))

    return urls


# ============================================================
# Dynamic Sitemap
# ============================================================

@app.get("/api/sitemap.xml")
async def dynamic_sitemap():
    today = date.today().isoformat()
    domain = os.environ.get("APP_DOMAIN", "https://realprofits.com")
    urls = []

    for path, pri, freq in STATIC_PAGES:
        urls.append(_build_sitemap_url(domain, path, pri, freq, today))

    for c in CATEGORY_SLUGS:
        urls.append(_build_sitemap_url(domain, f"/category/{c}", "0.7", "weekly", today))

    for s in CALCULATOR_SLUGS:
        urls.append(_build_sitemap_url(domain, f"/calculators/{s}", "0.8", "monthly", today))

    for s in TOOL_SLUGS:
        urls.append(_build_sitemap_url(domain, f"/tools/{s}", "0.8", "monthly", today))

    for s in CAREER_SLUGS:
        urls.append(_build_sitemap_url(domain, f"/{s}", "0.8", "monthly", today))

    for s in TAX_TOOL_SLUGS:
        urls.append(_build_sitemap_url(domain, f"/{s}", "0.8", "monthly", today))

    urls.extend(_build_guide_urls(domain, today))

    for s in ARTICLE_SLUGS:
        urls.append(_build_sitemap_url(domain, f"/articles/{s}", "0.7", "monthly", today))

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(urls) + '\n</urlset>'

    return Response(content=xml, media_type="application/xml")


@app.get("/api/sitemap/stats")
async def sitemap_stats():
    """Return page count stats for the pSEO system."""
    salary_count = len(_get_salary_amounts())
    tax_count = salary_count
    savings_count = len(_get_savings_amounts())
    mortgage_base = len(MORTGAGE_AMOUNTS)
    mortgage_rate = len(MORTGAGE_VARIANT_AMOUNTS) * len(MORTGAGE_RATES)
    mortgage_term = len(MORTGAGE_VARIANT_AMOUNTS) * len(MORTGAGE_TERMS)
    debt_count = len(DEBT_AMOUNTS) * 2
    freelancer_count = len(FREELANCER_AMOUNTS) * 2
    location_salary_count = len(LOCATION_SALARY_AMOUNTS) * len(CITY_SLUGS)

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
        "total_sitemap_urls": total_guides + len(STATIC_PAGES) + len(CATEGORY_SLUGS) + len(CALCULATOR_SLUGS) + len(TOOL_SLUGS) + len(CAREER_SLUGS) + len(TAX_TOOL_SLUGS) + len(ARTICLE_SLUGS),
    }
