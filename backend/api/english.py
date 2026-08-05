import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(prefix="/api/english", tags=["english"])
from api.llm_client import generate_content

class GenerateRequest(BaseModel):
    company_name: str
    topic: str
    program: str = "Full Stack Development"

@router.post("/generate")
async def generate_english_mcq(request: GenerateRequest):
    
    prompt = f"""
    You are an expert technical recruiter and English language evaluator.
    First, evaluate the company name: '{request.company_name}'. 
    Validate strictly if this is a REAL, well-known tech or corporate company. If it is a person's name (like 'varshith', 'john'), a random word, a gibberish string, or fake, return exactly this JSON:
    {{
        "error": "Invalid company name. Please provide a real company."
    }}
    
    HOWEVER, if it is a real company, you MUST generate exactly 20 distinct, highly realistic {request.topic} (English/Verbal) multiple-choice questions asked by {request.company_name}.
    If the topic is "Stream", tailor the English/Verbal questions specifically for a {request.program} role context.
    Topics can include Grammar, Reading Comprehension, Synonyms/Antonyms, or Sentence Correction.
    Order the questions strictly by frequency (most frequently asked first).
    
    Provide the response strictly as a JSON array of objects with the following schema:
    [
        {{
            "id": "eng_1",
            "type": "mcq",
            "title": "String, short title",
            "topic": "{request.topic}",
            "difficulty": "String",
            "description": "String, the complete problem statement or reading passage",
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
        raise HTTPException(status_code=500, detail="Failed to generate English questions")
