import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(prefix="/api/projects", tags=["projects"])
from api.llm_client import generate_content

class GenerateRequest(BaseModel):
    project_description: str
    program: str = "Full Stack Development"

@router.post("/generate")
async def generate_project_questions(request: GenerateRequest):
    
    if len(request.project_description) < 20:
        raise HTTPException(status_code=400, detail="Project description is too short.")
    
    prompt = f"""
    You are an expert Senior Staff Software Engineer interviewing a candidate about a project on their resume.
    
    Candidate's Project Description:
    "{request.project_description}"
    
    Generate exactly 3 highly specific, challenging, deep-dive interview questions about this exact project.
    Do NOT generate generic questions (like "what was your biggest challenge?").
    Instead, ask about architectural choices, scaling, specific technologies mentioned, trade-offs, or potential edge cases related to their description.
    
    Provide the response strictly as a JSON array of objects with the following schema:
    [
        {{
            "id": "proj_1",
            "type": "subjective",
            "title": "String, short title of the question",
            "description": "String, the complete, detailed deep-dive question"
        }}
    ]
    """

    try:
        raw_content = generate_content(prompt, json_mode=True)
        from api.json_utils import extract_and_parse_json
        data = extract_and_parse_json(raw_content)
        return data

    except Exception as e:
        print("Groq API Error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate project questions")
