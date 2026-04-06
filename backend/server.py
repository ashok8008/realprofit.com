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
        ).with_model("openai", "gpt-4o")
        
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
    """Improve a resume bullet point with stronger action verbs and quantified results"""
    
    system_message = """You are an expert resume writer. Your job is to improve resume bullet points to be more impactful.
    
Rules:
- Start with a strong action verb (Led, Developed, Implemented, Achieved, etc.)
- Include quantified results when possible (percentages, dollar amounts, time saved)
- Keep it concise (ideally under 20 words)
- Focus on impact and achievements, not just duties
- Use past tense for previous roles
- Be specific, not vague

Return ONLY the improved bullet point, nothing else."""

    user_prompt = f"""Improve this resume bullet point:
"{request.bullet_point}"

{f'Job Title: {request.job_title}' if request.job_title else ''}
{f'Context: {request.context}' if request.context else ''}

Return only the improved bullet point."""

    improved = await get_ai_response(system_message, user_prompt)
    
    # Generate suggestions
    suggestions_prompt = f"""Based on this bullet point: "{request.bullet_point}"

Give 3 brief tips to make it even stronger. Each tip should be one short sentence.
Format: Return only 3 lines, one tip per line, no numbers or bullets."""

    suggestions_response = await get_ai_response(
        "You are a helpful resume writing assistant. Be concise.",
        suggestions_prompt
    )
    
    suggestions = [s.strip() for s in suggestions_response.strip().split('\n') if s.strip()][:3]
    
    return BulletPointResponse(
        original=request.bullet_point,
        improved=improved.strip().strip('"'),
        suggestions=suggestions
    )

@app.post("/api/career-tools/improve-summary", response_model=SummaryResponse)
async def improve_summary(request: SummaryRequest):
    """Improve a professional summary for a resume"""
    
    system_message = """You are an expert resume writer specializing in professional summaries.
    
Rules:
- Keep it 50-80 words
- Start with a strong professional identity statement
- Highlight key achievements and skills
- Include years of experience if provided
- Make it compelling but not boastful
- Tailor to the job title if provided
- Use active voice

Return ONLY the improved summary, nothing else."""

    skills_text = ', '.join(request.skills[:5]) if request.skills else ''
    
    user_prompt = f"""Improve this professional summary:
"{request.current_summary}"

{f'Target Job Title: {request.job_title}' if request.job_title else ''}
{f'Years of Experience: {request.years_experience}' if request.years_experience else ''}
{f'Key Skills: {skills_text}' if skills_text else ''}

Return only the improved summary."""

    improved = await get_ai_response(system_message, user_prompt)
    improved_text = improved.strip().strip('"')
    word_count = len(improved_text.split())
    
    return SummaryResponse(
        original=request.current_summary,
        improved=improved_text,
        word_count=word_count
    )

@app.post("/api/career-tools/email-template", response_model=EmailTemplateResponse)
async def generate_email_template(request: EmailTemplateRequest):
    """Generate professional email templates for job search follow-ups"""
    
    templates = {
        'thank_you': {
            'system': "You are an expert at writing professional thank you emails after job interviews. Be warm, professional, and memorable.",
            'subject_prefix': "Thank You - "
        },
        'follow_up': {
            'system': "You are an expert at writing professional follow-up emails. Be polite, brief, and express continued interest.",
            'subject_prefix': "Following Up - "
        },
        'negotiation': {
            'system': "You are an expert at writing professional salary negotiation emails. Be confident but collaborative, data-driven but not aggressive.",
            'subject_prefix': "Regarding Offer - "
        },
        'decline': {
            'system': "You are an expert at writing professional but gracious job offer decline emails. Be appreciative and leave the door open.",
            'subject_prefix': "Regarding Your Offer - "
        },
        'accept': {
            'system': "You are an expert at writing professional job offer acceptance emails. Be enthusiastic but professional.",
            'subject_prefix': "Accepting Offer - "
        }
    }
    
    template_config = templates.get(request.template_type, templates['follow_up'])
    
    user_prompt = f"""Write a professional {request.template_type.replace('_', ' ')} email for:
- Company: {request.company_name}
- Position: {request.job_title}
{f'- Interviewer: {request.interviewer_name}' if request.interviewer_name else ''}
{f'- Interview Date: {request.interview_date}' if request.interview_date else ''}
{f'- Specific Points to Mention: {request.specific_points}' if request.specific_points else ''}

Format your response as:
SUBJECT: [subject line]
BODY:
[email body]

Keep the email concise (under 150 words). Use [Your Name] as the signature."""

    response = await get_ai_response(template_config['system'], user_prompt)
    
    # Parse response
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
        subject = f"{template_config['subject_prefix']}{request.job_title} at {request.company_name}"
    
    body = '\n'.join(body_lines).strip()
    if not body:
        body = response  # Fallback to full response if parsing fails
    
    return EmailTemplateResponse(
        subject=subject,
        body=body,
        template_type=request.template_type
    )

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
