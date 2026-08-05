import os
import json
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from typing import List, Optional
from .sql_executor import execute_sql_locally
from api.llm_client import generate_content
from api.prompts import (
    MASTER_SYSTEM_PROMPT,
    SOURCE_PRIORITY_RULES,
    HALLUCINATION_POLICY,
    COMPANY_MATCHING_RULES,
    QUALITY_SCORE_RULES,
    SQL_VALIDATION_RULES
)

router = APIRouter(prefix="/api/sql", tags=["sql"])

class GenerateRequest(BaseModel):
    company_name: str
    topic: str
    program: Optional[str] = "Full Stack Development"

class ExecuteRequest(BaseModel):
    code: str
    language: str
    stdin: Optional[str] = ""

class ProblemSetupRequest(BaseModel):
    title: str
    description: str
    examples: List[dict]
    topic: Optional[str] = None

class ReviewRequest(BaseModel):
    title: str
    description: str
    code: str
    language: str
    attempts: Optional[int] = 1

PISTON_LANGUAGES = {
    "python": {"language": "python", "version": "3.10.0"},
    "c": {"language": "c", "version": "10.2.0"},
    "cpp": {"language": "cpp", "version": "10.2.0"},
    "java": {"language": "java", "version": "15.0.2"},
    "sql": {"language": "sqlite3", "version": "3.36.0"},
    "javascript": {"language": "javascript", "version": "18.15.0"}
}

@router.post("/generate")
async def generate_company_question(request: GenerateRequest):
    
    topic_instruction = f"generate a comprehensive list of exactly 5 distinct, realistic, previous-year DATABASE QUERY interview questions (e.g. Find Nth Highest Salary, Department Top Three Salaries) asked by {request.company_name}. Make the problem description EXTREMELY ELABORATIVE and detailed, including the exact schema (table names, columns, and types) in a clear manner."
    format_instruction = "CRITICAL: Since this is SQL, you MUST format the 'input' in the examples as clear text-based Markdown tables representing the database tables. HOWEVER, the 'output' in the examples MUST be plain text EXACTLY matching the raw database engine output without any markdown table formatting (e.g. just the header name and the values below it, like 'salary\\n20000'). If the result is null/empty, the 'output' string should just be empty. Do not use Markdown tables for Output."

    prompt = f"""
    You are an expert technical interviewer.
    Your task is to {topic_instruction}
    If '{request.company_name}' is a known company (like Google, Amazon, Meta, TCS, Infosys, etc.), tailor the questions to their typical interview style. If it is not a well-known company, just provide standard high-quality interview questions.
    Order the questions strictly by the number of times they have been asked, in descending order (most frequently asked first).
    Order the questions strictly by the number of times they have been asked, in descending order (most frequently asked first).
    Do NOT include time and space complexity constraints (they do not apply to SQL).
    CRITICAL: You MUST strictly ensure that the Examples you generate accurately reflect all edge cases and rules mentioned in the Description. Do not create examples that contradict the rules.
    Provide the response strictly as a JSON object with the following schema:
    {{
        "questions": [
            {{
                "title": "String, name of the problem",
                "difficulty": "String, one of: Easy, Medium, Hard",
                "times_asked": "Integer, estimated number of times this was asked in recent years",
                "topic": "{request.topic}",
                "company": "{request.company_name}",
                "confidence": "String, HIGH/MEDIUM/LOW based on company matching",
                "description": "String, clear and ELABORATED problem statement. Include time and space constraints here.",
                "examples": [
                    {{ 
                        "input": "String, highly clear format (e.g., \\"nums = [1, 2], k = 3\\")", 
                        "output": "String",
                        "explanation": "String, a brief step-by-step explanation of why this input produces this output."
                    }}
                ],
                "constraints": [
                    "String"
                ]
            }}
        ]
    }}
    CRITICAL: Ensure ALL values in "examples" are valid JSON strings wrapped in double quotes. Do not use raw integers or unescaped commas.
    CRITICAL: Do NOT wrap the JSON in Markdown code blocks (e.g. ```json ... ```). Output RAW valid JSON.
    {format_instruction}
    """

    system_prompt = f"{MASTER_SYSTEM_PROMPT}\\n{SOURCE_PRIORITY_RULES}\\n{HALLUCINATION_POLICY}\\n{COMPANY_MATCHING_RULES}\\nYou output only raw valid JSON."

    try:
        response_text = generate_content(prompt, system_prompt=system_prompt, json_mode=True)
        data = json.loads(response_text)
        
        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error"])
            
        return data.get("questions", [])

    except HTTPException:
        raise
    except Exception as e:
        print("Groq API Error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate question")


@router.post("/execute")
async def execute_code(request: ExecuteRequest):
    if request.language != "sql":
        raise HTTPException(status_code=400, detail=f"Unsupported language for SQL route: {request.language}")

    try:
        result = execute_sql_locally(request.code, request.stdin or "")
        return result
    except Exception as e:
        print("Local Execution Error:", e)
        raise HTTPException(status_code=500, detail="Failed to execute code locally")


@router.post("/problem-setup")
async def generate_problem_setup(request: ProblemSetupRequest):
    
    test_case_instruction = "CRITICAL FOR SQL: `input_data` MUST be valid SQLite `CREATE TABLE` and `INSERT` statements to setup the database. `expected_output` MUST be the exact expected pipe-delimited (`|`) rows outputted by the SELECT query, AND the first row of `expected_output` MUST contain the column headers. Do NOT use markdown code blocks for the SQL script.\\n\\nEXTREMELY IMPORTANT: The test cases MUST STRICTLY adhere to the exact rules, constraints, and edge cases mentioned in the Description. If the description mentions a specific fallback or edge case (like 'if there are less than N distinct salaries, return highest'), you MUST include a testcase that triggers this, and the expected_output MUST reflect the fallback rule exactly. Do not output contradictory test cases."
    test_case_example = "CREATE TABLE Employee(id INT, salary INT);\\nINSERT INTO Employee VALUES (1, 100);"

    prompt = f"""
    You are an expert platform engineer building a LeetCode clone.
    Given the problem:
    Title: {request.title}
    Description: {request.description}
    Topic: {request.topic}
    Examples: {json.dumps(request.examples)}
    
    You need to generate:
    1. `optimal_solution`: A completely correct, highly optimal SQL query that solves the problem perfectly. We will use this to verify the test cases locally!
    2. `solution_stubs`: The exact starter code the user sees in the editor for 'sql'. For sql, it should just be `-- Write your SQL query here\\n`.
    3. `hidden_mains`: The hidden `main` block code that executes the user's query. For sql, it should just be an empty string `""`.
    4. `test_cases`: Exactly 3 to 5 test cases containing `input_data`.
       {test_case_instruction}

    Format the response STRICTLY as a JSON object:
    {{
        "optimal_solution": "SELECT ... FROM ...",
        "solution_stubs": {{
            "sql": "-- Write your SQL query here\\n"
        }},
        "hidden_mains": {{
            "sql": ""
        }},
        "test_cases": [
            {{
                "input_data": "{test_case_example}",
                "expected_output": ""
            }}
        ]
    }}
    """
    
    system_prompt = f"{MASTER_SYSTEM_PROMPT}\\n{SQL_VALIDATION_RULES}\\n{QUALITY_SCORE_RULES}\\nYou output only raw valid JSON."
    
    try:
        response_text = generate_content(prompt, system_prompt=system_prompt, json_mode=True)
        data = json.loads(response_text)
        
        # --- VERIFICATION LOOP ---
        optimal_code = data.get("optimal_solution", "")
        # Clean markdown code blocks if AI added them
        import re
        optimal_code = re.sub(r'^```[a-zA-Z]*\n', '', optimal_code)
        optimal_code = re.sub(r'```$', '', optimal_code.strip())
        
        if optimal_code:
            for tc in data.get("test_cases", []):
                input_data = tc["input_data"]
                input_data = re.sub(r'^```[a-zA-Z]*\n', '', input_data)
                input_data = re.sub(r'```$', '', input_data.strip())
                
                result = execute_sql_locally(optimal_code, input_data)
                if result.get("success"):
                    # Overwrite the expected output with the actual computed output!
                    tc["expected_output"] = result["output"].strip()
                else:
                    # If it fails, fallback to something or keep whatever the LLM generated
                    print("Verification Loop Warning: Optimal solution failed on test case:", result.get("stderr"))
                    print(f"Failed query: {optimal_code}")
                    print(f"Input Data: {input_data}")

        return data
    except Exception as e:
        print("Setup Error:", e)
        raise HTTPException(status_code=500, detail="Failed to setup problem execution logic.")

@router.post("/review")
async def review_optimal_solution(request: ReviewRequest):
        
    if request.attempts and request.attempts >= 3:
        prompt = f"""
        The user has submitted their SQL logic for the problem '{request.title}' for the {request.attempts}th time.
        
        User's Last Submitted SQL:
        {request.code}
        
        Please evaluate their final attempt. If it's still wrong or suboptimal, act as an empathetic technical interviewer and finally EXPLAIN the correct query to them.
        1. Point out any good parts of their logic.
        2. Provide the complete OPTIMAL SQL query.
        3. Explain the optimal query step-by-step.
        4. DRY RUN the optimal query using one of the examples.
        
        Output strictly as a JSON object with this exact schema:
        {{
            "feedback": "Your markdown formatted feedback string here. IMPORTANT: You MUST include the actual optimal SQL query formatted in markdown code blocks WITHIN this feedback string, followed by the dry run.",
            "is_correct": false,
            "optimal_code": "The raw optimal query solution string here (without markdown)"
        }}
        """
    else:
        prompt = f"""
        The user has submitted their SQL logic/query for the following problem:
        Title: {request.title}
        Description: {request.description}
        
        User's Submitted SQL:
        {request.code}
        
        Please act as an expert technical interviewer evaluating their logic (Attempt {request.attempts}/3). 
        First, determine internally if the user's logic is fundamentally CORRECT or WRONG.
        
        IF THEIR LOGIC IS CORRECT:
        1. Confirm that their logic is correct and praise their approach.
        2. Perform a DRY RUN of THEIR logic using an example to show exactly what is happening in their query.
        3. If a more optimal approach exists (e.g. better use of indices, avoiding subqueries when joins work), explain it conceptually.
        
        IF THEIR LOGIC IS WRONG:
        1. Explain that their logic is incorrect and point out the fundamental flaws or edge cases they missed.
        2. Give them a strong hint on how they can do this query correctly (e.g., "You can solve this by using a LEFT JOIN...").
        3. CRITICAL: Since they are on attempt {request.attempts} (less than 3), you MUST NOT provide the actual correct code solution. Let them try again.
        
        Output strictly as a JSON object with this exact schema:
        {{
            "feedback": "Your markdown formatted feedback string here.",
            "is_correct": true or false,
            "optimal_code": null
        }}
        """
    try:
        response_text = generate_content(prompt, system_prompt="You are a friendly senior engineer reviewing code.", json_mode=True)
        data = json.loads(response_text)
        return data
    except Exception as e:
        print("Review Error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate review.")
