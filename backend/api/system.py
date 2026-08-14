import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(prefix="/api/system", tags=["system"])
from api.llm_client import generate_content

class GenerateRequest(BaseModel):
    company_name: str
    program: str = "Full Stack Development"

@router.post("/generate")
async def generate_system_design(request: GenerateRequest):
    from api.llm_client import validate_company
    if hasattr(request, 'company_name') and request.company_name:
        if not validate_company(request.company_name):
            raise HTTPException(status_code=400, detail="Invalid company name. Please enter a valid company name.")

    
    prompt = f"""
    You are an expert Principal Engineer conducting a System Design interview.
    Assume '{request.company_name}' is a valid company name. You MUST generate exactly 20 distinct, highly realistic System Design (HLD/LLD) interview questions asked by {request.company_name}.
    
    Provide the response strictly as a JSON array of objects with the following schema:
    [
        {{
            "id": "sys_1",
            "type": "subjective",
            "title": "String, short title (e.g. 'Design Netflix')",
            "description": "String, detailed problem statement including functional and non-functional requirements",
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
        raise HTTPException(status_code=500, detail="Failed to generate system design questions")
