import os
import json
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from resume.parser import resume_parser

router = APIRouter(prefix="/api/mcq", tags=["mcq"])

from api.llm_client import generate_content

class GenerateRequest(BaseModel):
    company_name: str
    topic: str  # DSA, SQL, System Design
    program: str = "Full Stack Development"

def get_mcq_schema(topic_name: str):
    return f"""
    {{
        "questions": [
            {{
                "title": "String, short title of the question",
                "difficulty": "String, one of: Easy, Medium, Hard",
                "times_asked": "Integer, estimated number of times asked",
                "topic": "{topic_name}",
                "company": "String, company name (if applicable)",
                "description": "String, detailed problem statement",
                "options": [
                    "String, exactly 4 clear options (e.g. 'A) ...', 'B) ...')"
                ],
                "correct_answer": "String, the EXACT string of the correct option",
                "explanation": "String, highly detailed step-by-step logic",
                "hint": "String, a subtle but helpful AI hint for the user who is stuck. Do NOT reveal the answer."
            }}
        ]
    }}
    CRITICAL: Ensure the options array has exactly 4 items. Ensure correct_answer exactly matches one of the options.
    """

@router.post("/generate")
async def generate_standard_mcq(request: GenerateRequest):
    from api.llm_client import validate_company
    if hasattr(request, 'company_name') and request.company_name:
        if not validate_company(request.company_name):
            raise HTTPException(status_code=400, detail="Invalid company name. Please enter a valid company name.")

    
    prompt = f"""
    You are an expert technical interviewer.
    Your task is to generate exactly 20 distinct, highly realistic {request.topic} multiple-choice interview questions asked by {request.company_name} for a {request.program} candidate.
    If the topic is "Stream", tailor the questions specifically for a {request.program} role.
    If '{request.company_name}' is a known company, tailor the questions to their typical interview style. If it is not a well-known company, just provide standard high-quality interview questions.
    Order the questions strictly by frequency (most frequently asked first).
    Provide the response strictly as a JSON object with the following schema. CRITICAL: Do NOT wrap the JSON in Markdown code blocks (e.g. ```json ... ```). Output RAW valid JSON:
    {get_mcq_schema(request.topic)}
    """

    try:
        raw_response = generate_content(prompt, json_mode=True)
        
        data = json.loads(raw_response)
        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error"])
            
        return data.get("questions", [])

    except HTTPException:
        raise
    except Exception as e:
        print("Groq API Error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate questions")

from fastapi import Form

@router.post("/generate-from-resume")
async def generate_resume_mcq(file: UploadFile = File(...), program: str = Form("Full Stack Development")):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        content = await file.read()
        parsed_text = resume_parser.parse_pdf(content)
        
        prompt = f"""
        You are a senior technical interviewer preparing a candidate for a {program} role. I will provide a candidate's parsed resume text.
        Extract the core technical skills, programming languages, and tools the candidate claims to know that are relevant to the {program} track.
        Then, generate exactly 20 highly personalized, advanced Multiple-Choice Questions (MCQs) designed to thoroughly test their knowledge on THOSE SPECIFIC skills.
        
        Make the questions challenging (Medium to Hard difficulty).
        Provide the response strictly as a JSON object with the following schema. CRITICAL: Do NOT wrap the JSON in Markdown code blocks (e.g. ```json ... ```). Output RAW valid JSON:
        {get_mcq_schema("Resume-Based")}
        
        Resume Text:
        {parsed_text}
        """

        raw_response = generate_content(prompt, system_prompt="You output only valid JSON.", json_mode=True)
        
        data = json.loads(raw_response)
        questions = data.get("questions", [])
        
        # Override company field for UI badge
        for q in questions:
            q["company"] = "Personalized"
            
        return questions

    except Exception as e:
        print("Groq API Error:", e)
        raise HTTPException(status_code=500, detail="Failed to parse resume and generate questions.")
