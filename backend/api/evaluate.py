import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(prefix="/api/evaluate", tags=["evaluate"])
from api.llm_client import generate_content

class EvaluateRequest(BaseModel):
    question: str
    user_answer: str
    context: str = ""

@router.post("/")
async def evaluate_subjective_answer(request: EvaluateRequest):
    
    prompt = f"""
    You are an expert technical interviewer evaluating a candidate's answer.
    
    Question: {request.question}
    Context (if any): {request.context}
    
    Candidate's Answer: {request.user_answer}
    
    Evaluate the candidate's answer based on clarity, correctness, depth, and completeness.
    Be strict but fair.
    
    Provide the response strictly as a JSON object with the following schema. CRITICAL: Do NOT wrap the JSON in Markdown code blocks (e.g. ```json ... ```). Output RAW valid JSON:
    {{
        "score": Integer (0 to 10),
        "feedback": "String, detailed paragraph explaining what was good and what was missing",
        "ideal_answer": "String, a brief example of a perfect 10/10 response"
    }}
    """

    try:
        raw_content = generate_content(prompt, json_mode=True)
        data = json.loads(raw_content)
        return data

    except Exception as e:
        print("Groq API Error:", e)
        raise HTTPException(status_code=500, detail="Failed to evaluate answer")
