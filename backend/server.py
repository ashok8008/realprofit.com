from fastapi import FastAPI, HTTPException
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
