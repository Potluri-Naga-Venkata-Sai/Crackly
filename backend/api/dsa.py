import os
import json
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from typing import List, Optional, Dict, Any
from .dsa_executor import execute_code_locally
from .judge0_client import judge0, STATUS_MAP

router = APIRouter(prefix="/api/dsa", tags=["coding"])

from api.llm_client import generate_content
from api.prompts import (
    MASTER_SYSTEM_PROMPT,
    SOURCE_PRIORITY_RULES,
    HALLUCINATION_POLICY,
    COMPANY_MATCHING_RULES,
    QUALITY_SCORE_RULES,
    DSA_VALIDATION_RULES
)

class GenerateRequest(BaseModel):
    company_name: str
    topic: str
    program: Optional[str] = "Full Stack Development"

class ExecuteRequest(BaseModel):
    code: str
    language: str
    stdin: Optional[str] = ""

class RunRequest(BaseModel):
    code: str
    language: str
    test_cases: List[Dict[str, Any]]
    hidden_main: Optional[str] = ""

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
    
    if request.topic == "Stream":
        topic_instruction = f"generate a comprehensive list of exactly 5 distinct, realistic, previous-year coding interview questions asked by {request.company_name} specifically for a {request.program} candidate."
    else:
        topic_instruction = f"generate a comprehensive list of exactly 5 distinct, realistic, previous-year {request.topic} interview questions asked by {request.company_name}."

    format_instruction = ""

    prompt = f"""
    You are an expert technical interviewer.
    Your task is to {topic_instruction}
    If '{request.company_name}' is a known company (like Google, Amazon, Meta, TCS, Infosys, etc.), tailor the questions to their typical interview style. If it is not a well-known company, just provide standard high-quality interview questions.
    Order the questions strictly by the number of times they have been asked, in descending order (most frequently asked first).
    Order the questions strictly by the number of times they have been asked, in descending order (most frequently asked first).
    CRITICAL: You MUST strictly ensure that the Examples you generate accurately reflect all edge cases and rules mentioned in the Description. Do not create examples that contradict the rules.
    Provide a highly detailed, elaborated problem statement including explicit time and space complexity constraints.
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
    if request.language not in PISTON_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language}")

    try:
        result = execute_code_locally(request.language, request.code, request.stdin or "")
        return result
    except Exception as e:
        print("Local Execution Error:", e)
        raise HTTPException(status_code=500, detail="Failed to execute code locally")

@router.post("/run")
async def run_code(request: RunRequest):
    """
    Executes a batch of test cases locally.
    """
    final_code = request.code
    if request.hidden_main:
        final_code += "\n" + request.hidden_main

    if request.language not in PISTON_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language}")

    normalized = []
    
    for tc in request.test_cases:
        try:
            stdin = tc.get("input_data", "")
            expected_output = tc.get("expected_output", "")
            
            result = execute_code_locally(request.language, final_code, stdin)
            
            if result.get("success"):
                actual = (result.get("stdout") or "").strip()
                expected = expected_output.strip()
                passed = actual == expected
                status_desc = "ACCEPTED" if passed else "WRONG_ANSWER"
                
                normalized.append({
                    "success": passed,
                    "status": status_desc,
                    "stdout": result.get("stdout") or "",
                    "stderr": result.get("stderr") or "",
                    "time": None,
                    "memory": None,
                    "passed": passed,
                    "actual_output": actual
                })
            else:
                normalized.append({
                    "success": False,
                    "status": "COMPILATION_ERROR" if "compile" in (result.get("stderr") or "").lower() else "RUNTIME_ERROR",
                    "stdout": result.get("stdout") or "",
                    "stderr": result.get("output") or result.get("stderr") or "",
                    "time": None,
                    "memory": None,
                    "passed": False,
                    "actual_output": ""
                })
                
        except Exception as e:
            print("Execution Error:", e)
            normalized.append({
                "success": False,
                "status": "INTERNAL_ERROR",
                "stdout": "",
                "stderr": str(e),
                "time": None,
                "memory": None,
                "passed": False,
                "actual_output": ""
            })
            
    return {"results": normalized}


@router.post("/problem-setup")
async def generate_problem_setup(request: ProblemSetupRequest):
    
    test_case_instruction = "CRITICAL FOR DSA: `input_data` is raw STDIN (e.g. `5\\n1 2 3 4 5`). If input is an array, it MUST START with the length.\\n\\nEXTREMELY IMPORTANT: The test cases MUST STRICTLY adhere to the exact rules, constraints, and edge cases mentioned in the Description. If the description mentions a specific fallback or edge case, you MUST include a testcase that triggers this, and the expected_output MUST reflect the fallback rule exactly. Do not output contradictory test cases."
    test_case_example = "5\\n1 2 3 4 5"

    prompt = f"""
    You are an expert platform engineer building a LeetCode clone.
    Given the problem:
    Title: {request.title}
    Description: {request.description}
    Topic: {request.topic}
    Examples: {json.dumps(request.examples)}
    
    You need to generate:
    1. `optimal_python_script`: A completely correct, fully runnable Python script that solves the problem perfectly. It MUST include `sys.stdin.read().split()` or whatever is needed to parse the input, solve the problem, and `print()` the result. We will run this script to verify your test cases!
    2. `solution_stubs`: The exact starter code the user sees in the editor for 'python', 'cpp', 'java', 'javascript'.
    3. `hidden_mains`: The hidden `main` block code that executes the user's code for 'python', 'cpp', 'java', 'javascript'. CRITICAL: You MUST write the FULL parsing logic in `hidden_mains` to read `input_data`, parse it into the correct data types (even complex ones like Trees or Linked Lists), call the user's class/function, and print the output. It MUST compile and run flawlessly with your `solution_stubs`.
    4. `test_cases`: Exactly 3 to 5 test cases containing `input_data`.
       {test_case_instruction}

    Format the response STRICTLY as a JSON object:
    {{
        "optimal_python_script": "import sys\\n...",
        "solution_stubs": {{
            "python": "def solve(nums):\\n    pass",
            "cpp": "#include <bits/stdc++.h>\\nusing namespace std;\\n\\nint solve(vector<int>& nums) {{\\n    \\n}}",
            "java": "import java.util.*;\\n\\npublic class main {{\\n    public static int solve(int[] nums) {{\\n        \\n    }}",
            "javascript": "function solve(nums) {{\\n    \\n}}"
        }},
        "hidden_mains": {{
            "python": "\\nif __name__ == '__main__':\\n    import sys\\n    input_data = sys.stdin.read().split()\\n    # Write full logic to parse input_data, call the user's function/class, and print output",
            "cpp": "\\nint main() {{\\n    // Write full C++ parsing logic using cin, call the user's function/class, and print to cout\\n    return 0;\\n}}",
            "java": "\\n    public static void main(String[] args) {{\\n        // Write full Java parsing logic using Scanner, call the user's function/class, and System.out.println\\n    }}\\n}}",
            "javascript": "\\nconst fs = require('fs');\\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\\\s+/);\\n// Write full JS parsing logic, call the user's function/class, and console.log\\n"
        }},
        "test_cases": [
            {{
                "input_data": "{test_case_example}",
                "expected_output": ""
            }}
        ]
    }}
    """
    
    system_prompt = f"{MASTER_SYSTEM_PROMPT}\\n{DSA_VALIDATION_RULES}\\n{QUALITY_SCORE_RULES}\\nYou output only raw valid JSON."
    
    try:
        response_text = generate_content(prompt, system_prompt=system_prompt, json_mode=True)
        data = json.loads(response_text)
        
        # --- VERIFICATION LOOP ---
        optimal_code = data.get("optimal_python_script", "")
        # Clean markdown code blocks
        import re
        optimal_code = re.sub(r'^```[a-zA-Z]*\n', '', optimal_code)
        optimal_code = re.sub(r'```$', '', optimal_code.strip())
        
        if optimal_code:
            for tc in data.get("test_cases", []):
                input_data = tc["input_data"]
                input_data = re.sub(r'^```[a-zA-Z]*\n', '', input_data)
                input_data = re.sub(r'```$', '', input_data.strip())
                
                result = execute_code_locally("python", optimal_code, input_data)
                if result.get("success"):
                    # Overwrite the expected output with the actual computed output!
                    tc["expected_output"] = result["output"].strip()
                else:
                    print("Verification Loop Warning: Optimal python script failed on test case:", result.get("stderr"))
                    
        return data
    except Exception as e:
        print("Setup Error:", e)
        raise HTTPException(status_code=500, detail="Failed to setup problem execution logic.")

@router.post("/review")
async def review_optimal_solution(request: ReviewRequest):
        
    if request.attempts and request.attempts >= 3:
        prompt = f"""
        The user has submitted their logic for the problem '{request.title}' for the {request.attempts}th time.
        
        User's Last Submitted Logic/Code:
        {request.code}
        
        Please evaluate their final attempt. If it's still wrong or suboptimal, act as an empathetic technical interviewer and finally EXPLAIN the correct code to them.
        1. Point out any good parts of their logic.
        2. Provide the complete OPTIMAL code solution in {request.language}.
        3. Explain the optimal code step-by-step.
        4. DRY RUN the optimal code using one of the examples.
        
        Output strictly as a JSON object with this exact schema:
        {{
            "feedback": "Your markdown formatted feedback string here. IMPORTANT: You MUST include the actual optimal code solution formatted in markdown code blocks WITHIN this feedback string, followed by the dry run.",
            "is_correct": false,
            "optimal_code": "The raw optimal code solution string here (without markdown)"
        }}
        """
    else:
        prompt = f"""
        The user has submitted their logic/pseudo-code for the following problem:
        Title: {request.title}
        Description: {request.description}
        Language: {request.language} (The user might just write logic or pseudo-code, which is fine)
        
        User's Submitted Logic/Code:
        {request.code}
        
        Please act as an expert technical interviewer evaluating their logic (Attempt {request.attempts}/3). 
        First, determine internally if the user's logic is fundamentally CORRECT or WRONG.
        
        IF THEIR LOGIC IS CORRECT:
        1. Confirm that their logic is correct and praise their approach.
        2. Perform a DRY RUN of THEIR logic using an example to show exactly what is happening in their code.
        3. State the time and space complexity of their approach.
        4. If a more optimal approach exists, explain it conceptually.
        
        IF THEIR LOGIC IS WRONG:
        1. Explain that their logic is incorrect and point out the fundamental flaws or edge cases they missed.
        2. Give them a strong hint on how they can do this question correctly (e.g., "You can solve this by using a hash map...").
        3. State the time/space complexity of their flawed approach.
        4. CRITICAL: Since they are on attempt {request.attempts} (less than 3), you MUST NOT provide the actual correct code solution. Let them try again.
        
        Output strictly as a JSON object with this exact schema:
        {{
            "feedback": "Your markdown formatted feedback string here.",
            "is_correct": true or false,
            "optimal_code": null
        }}
        """
        
    try:
        response_text = generate_content(prompt, system_prompt="You are a strict but helpful senior interviewer reviewing a candidate's logic on a whiteboard.", json_mode=True)
        data = json.loads(response_text)
        return data
    except Exception as e:
        print("Review Error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate review.")
