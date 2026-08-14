import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(prefix="/api/theory", tags=["theory"])
from api.llm_client import generate_content

class GenerateRequest(BaseModel):
    company_name: str
    topic: str
    program: str = "Full Stack Development"

@router.post("/generate")
async def generate_theory_mcq(request: GenerateRequest):
    from api.llm_client import validate_company
    if hasattr(request, 'company_name') and request.company_name:
        if not validate_company(request.company_name):
            raise HTTPException(status_code=400, detail="Invalid company name. Please enter a valid company name.")

    
    prompt = f"""
    You are an expert technical interviewer evaluating Computer Science fundamentals.
    Assume '{request.company_name}' is a valid company name. You MUST generate exactly 20 distinct, highly realistic theoretical {request.topic} multiple-choice questions asked by {request.company_name}.
    If the topic is "Stream", tailor the theoretical questions specifically for a {request.program} role context.
    Topics can include Operating Systems, DBMS, Computer Networks, or OOPs depending on {request.topic}.
    Order the questions strictly by frequency (most frequently asked first).
    
    Provide the response strictly as a JSON array of objects with the following schema:
    [
        {{
            "id": "theo_1",
            "type": "mcq",
            "title": "String, short title",
            "topic": "{request.topic}",
            "difficulty": "String",
            "description": "String, the complete problem statement",
            "options": [
                "String, exactly 4 clear options (e.g. 'A) ...', 'B) ...')"
            ],
            "correct_answer": "String, the EXACT string of the correct option",
            "explanation": "String, detailed step-by-step logic",
            "times_asked": 0,
            "company": "{request.company_name}"
        }}
    ]
    """

    try:
        raw_content = generate_content(prompt, json_mode=True)
        from api.json_utils import extract_and_parse_json
        data = extract_and_parse_json(raw_content)
        
        if isinstance(data, dict) and "error" in data:
            raise HTTPException(status_code=400, detail=data["error"])
            
        return data

    except HTTPException:
        raise
    except Exception as e:
        print("Groq API Error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate theory questions")
