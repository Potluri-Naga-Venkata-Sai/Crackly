import os
import json
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from resume.parser import resume_parser

router = APIRouter(prefix="/api/mixed", tags=["mixed"])
from api.llm_client import generate_content

class GenerateRequest(BaseModel):
    company_name: str
    program: str = "Full Stack Development"

@router.post("/generate")
async def generate_mixed_assessment(request: GenerateRequest):
    
    prompt = f"""
    You are an expert technical interviewer.
    First, evaluate the company name: '{request.company_name}'. 
    Validate strictly if this is a REAL, well-known tech or corporate company. If it is a person's name (like 'varshith', 'john'), a random word, a gibberish string, or fake, return exactly this JSON:
    {{
        "error": "Invalid company name. Please provide a real company."
    }}
    
    If it is a valid company, generate an exact 20-question mixed assessment test for a {request.program} candidate at '{request.company_name}'.
    The test must include a mix of Aptitude, Coding Theory, Logic, and System Design questions.:
    
    SECTION 1: Coding
    Generate EXACTLY 2 distinct, highly realistic, previous-year coding questions asked by {request.company_name}.
    Include highly detailed problem statements, examples, and time/space constraints.
    
    SECTION 2: Aptitude
    Generate EXACTLY 18 Multiple-Choice Questions (MCQs) typical for {request.company_name} online assessments, focusing strongly on {request.program} concepts.
    Specifically:
    - 6 Quantitative Aptitude questions
    - 6 Logical/Analytical Reasoning questions
    - 6 Verbal Ability questions
    
    Provide the response strictly as a JSON object with the following schema. CRITICAL: Do NOT wrap the JSON in Markdown code blocks (e.g. ```json ... ```). Output RAW valid JSON:
    {{
        "coding_questions": [
            {{
                "id": "coding_1",
                "type": "coding",
                "title": "String",
                "difficulty": "String, one of: Medium, Hard",
                "description": "String, clear and ELABORATED problem statement. Include time/space constraints.",
                "examples": [
                    {{ "input": "String", "output": "String" }}
                ],
                "constraints": ["String"]
            }}
        ],
        "aptitude_questions": [
            {{
                "id": "apt_1",
                "type": "mcq",
                "title": "String, short title",
                "topic": "String, one of: Quantitative, Logical, Verbal",
                "difficulty": "String",
                "description": "String, the complete problem statement",
                "options": [
                    "String, exactly 4 clear options (e.g. 'A) ...', 'B) ...')"
                ],
                "correct_answer": "String, the EXACT string of the correct option",
                "explanation": "String, detailed step-by-step logic"
            }}
        ]
    }}
    CRITICAL: 
    - Ensure `coding_questions` has EXACTLY 2 items.
    - Ensure `aptitude_questions` has EXACTLY 18 items.
    - Ensure ALL values in "examples" are valid JSON strings wrapped in double quotes. Do not use raw integers or unescaped commas.
    - Ensure the options array has exactly 4 items. Ensure correct_answer exactly matches one of the options.
    """

    try:
        raw_content = generate_content(prompt, json_mode=True)
        data = json.loads(raw_content)
        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error"])
            
        return data

    except HTTPException:
        raise
    except Exception as e:
        print("Groq API Error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate assessment")

@router.post("/generate-resume")
async def generate_mixed_assessment_resume(
    file: UploadFile = File(...),
    program: str = Form("Full Stack Development")
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        content = await file.read()
        parsed_text = resume_parser.parse_pdf(content)
        
        prompt = f"""
        You are an expert technical interviewer.
        I am providing you with the parsed text of a candidate's resume.
        Generate an exact 20-question mixed assessment test for this candidate, focusing heavily on the specific programming languages, frameworks, databases, and tools mentioned in their resume.
        
        Resume Content:
        {parsed_text}
        
        The test must include a mix of Aptitude, Coding Theory, Logic, and System Design questions.
        
        SECTION 1: Coding
        Generate EXACTLY 2 distinct, highly realistic coding questions. The problems should be solvable using the primary languages found in the resume.
        Include highly detailed problem statements, examples, and time/space constraints.
        
        SECTION 2: Aptitude
        Generate EXACTLY 18 Multiple-Choice Questions (MCQs) typical for online assessments, focusing strongly on {program} concepts AND the candidate's specific tech stack from the resume.
        Specifically:
        - 6 Quantitative Aptitude questions
        - 6 Logical/Analytical Reasoning questions
        - 6 Technical/Verbal questions directly related to their resume skills.
        
        Provide the response strictly as a JSON object with the following schema. CRITICAL: Do NOT wrap the JSON in Markdown code blocks (e.g. ```json ... ```). Output RAW valid JSON:
        {{
            "coding_questions": [
                {{
                    "id": "coding_1",
                    "type": "coding",
                    "title": "String",
                    "difficulty": "String, one of: Medium, Hard",
                    "description": "String, clear and ELABORATED problem statement. Include time/space constraints.",
                    "examples": [
                        {{ "input": "String", "output": "String" }}
                    ],
                    "constraints": ["String"]
                }}
            ],
            "aptitude_questions": [
                {{
                    "id": "apt_1",
                    "type": "mcq",
                    "title": "String, short title",
                    "topic": "String, one of: Quantitative, Logical, Technical",
                    "difficulty": "String",
                    "description": "String, the complete problem statement",
                    "options": [
                        "String, exactly 4 clear options (e.g. 'A) ...', 'B) ...')"
                    ],
                    "correct_answer": "String, the EXACT string of the correct option",
                    "explanation": "String, detailed step-by-step logic"
                }}
            ]
        }}
        CRITICAL: 
        - Ensure `coding_questions` has EXACTLY 2 items.
        - Ensure `aptitude_questions` has EXACTLY 18 items.
        - Ensure ALL values in "examples" are valid JSON strings wrapped in double quotes. Do not use raw integers or unescaped commas.
        - Ensure the options array has exactly 4 items. Ensure correct_answer exactly matches one of the options.
        """

        raw_content = generate_content(prompt, json_mode=True)
        data = json.loads(raw_content)
        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error"])
            
        return data

    except Exception as e:
        print("Groq API Error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate resume-based assessment")
