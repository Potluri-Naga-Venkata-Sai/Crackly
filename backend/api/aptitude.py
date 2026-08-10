import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from typing import List

router = APIRouter(prefix="/api/aptitude", tags=["aptitude"])

from api.llm_client import generate_content

class GenerateRequest(BaseModel):
    company_name: str
    topic: str  # Quantitative, Logical, Verbal
    program: str = "Full Stack Development"

@router.post("/generate")
async def generate_aptitude_questions(request: GenerateRequest):
    
    prompt = f"""
    You are an expert technical recruiter and interviewer. 
    Assume '{request.company_name}' is a valid company name. You MUST generate a comprehensive list of exactly 20 distinct, realistic, previous-year {request.topic} aptitude/reasoning questions asked by {request.company_name} for a {request.program} candidate.
    Order the questions strictly by the number of times they have been asked, in descending order (most frequently asked first).
    Provide a highly detailed problem statement. 
    Provide the response strictly as a JSON object with the following schema. CRITICAL: Do NOT wrap the JSON in Markdown code blocks (e.g. ```json ... ```). Output RAW valid JSON:
    {{
        "questions": [
            {{
                "title": "String, short title summarizing the problem",
                "difficulty": "String, one of: Easy, Medium, Hard",
                "times_asked": "Integer, estimated number of times this was asked in recent years",
                "topic": "{request.topic}",
                "company": "{request.company_name}",
                "description": "String, the complete problem statement or paragraph.",
                "options": [
                    "String, exactly 4 clear options (e.g. 'A) 45', 'B) 50', 'C) 55', 'D) 60')"
                ],
                "correct_answer": "String, the EXACT string of the correct option from the options array.",
                "explanation": "String, a highly detailed step-by-step mathematical or logical explanation of how to solve the problem."
            }}
        ]
    }}
    CRITICAL: Ensure the options array has exactly 4 string items. Ensure the correct_answer exactly matches one of the options. Do not use raw integers or unescaped commas inside strings.
    """

    try:
        response_text = generate_content(prompt, json_mode=True)
        data = json.loads(response_text)
        
        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error"])
            
        return data.get("questions", [])

    except HTTPException:
        raise
    except Exception as e:
        print("Groq API Error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate questions")
