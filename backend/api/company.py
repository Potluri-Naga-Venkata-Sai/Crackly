import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(prefix="/api/company", tags=["company"])
from api.llm_client import generate_content

class GenerateRequest(BaseModel):
    company_name: str
    program: str = "Full Stack Development"

@router.post("/generate")
async def generate_company_behavioral(request: GenerateRequest):
    
    prompt = f"""
    You are an expert HR Manager for {request.company_name}.
    Your task is to generate exactly 5 highly realistic behavioral and cultural fit interview questions asked by {request.company_name} (e.g. based on their Leadership Principles or Core Values).
    If '{request.company_name}' is a known company, tailor the questions to their typical interview style. If it is not a well-known company, just provide standard high-quality behavioral questions.
    
    Provide the response strictly as a JSON array of objects with the following schema:
    [
        {{
            "id": "comp_1",
            "type": "subjective",
            "title": "String, short title (e.g. 'Customer Obsession')",
            "description": "String, detailed behavioral question (e.g. 'Tell me about a time when...')",
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
        raise HTTPException(status_code=500, detail="Failed to generate company questions")
