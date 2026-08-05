import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List


router = APIRouter(prefix="/api/interview", tags=["interview"])
from api.llm_client import generate_content

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    company: str
    role: str
    resume_text: str = None
    program: str = "Full Stack Development"

@router.post("/chat")
async def chat_interview(request: ChatRequest):
    
    resume_context = f"Candidate's Resume Text:\n{request.resume_text}\n" if request.resume_text else ""
    
    system_prompt = f"""
    You are a strict, senior Technical Interviewer at {request.company}.
    You are interviewing the user for a {request.role} role. The candidate is part of a {request.program} track.
    
    {resume_context}
    
    Guidelines:
    1. Stay completely in character. Do not break the fourth wall.
    2. Ask ONE question at a time. Wait for the user's answer.
    3. Evaluate their previous answer briefly (or push back if it's poor), then move on to the next question.
    4. Mix behavioral and technical questions based on the {request.company} culture and {request.role} requirements.
    5. If the Candidate's Resume Text is provided above, you MUST ask highly specific, targeted questions diving deep into their claimed projects and skills.
    6. Do not write essays. Keep your responses concise and conversational (like a real spoken interview).
    """

    # Convert messages to a single prompt string
    chat_history = []
    for msg in request.messages:
        role = "Interviewer" if msg.role == "assistant" else "Candidate"
        chat_history.append(f"{role}: {msg.content}")
        
    prompt = "Conversation History:\n" + "\n".join(chat_history) + "\n\nInterviewer (You): "

    try:
        response_text = generate_content(prompt, system_prompt=system_prompt, json_mode=False)
        return {"response": response_text}

    except Exception as e:
        print("Groq API Error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate response")

class FeedbackRequest(BaseModel):
    messages: List[Message]
    company: str
    role: str
    program: str = "Full Stack Development"

@router.post("/feedback")
async def generate_feedback(request: FeedbackRequest):
        
    system_prompt = f"""
    You are an expert technical interviewer and recruiter at {request.company}.
    You have just finished an interview with a candidate for a {request.role} role (Program Track: {request.program}).
    
    You must evaluate the candidate's performance based on the transcript provided in the chat history.
    Provide a comprehensive feedback report in JSON format EXACTLY matching the following structure:
    {{
      "overallScore": <integer out of 50>,
      "maxScore": 50,
      "readiness": <integer 0-100 representing readiness percentage>,
      "strongAnswers": <integer count of answers scoring >= 7>,
      "needPractice": <integer count of answers scoring < 7>,
      "executiveSummary": "<A 3-4 sentence paragraph summarizing their performance>",
      "skills": {{
        "correctness": <integer 0-100>,
        "technicalDepth": <integer 0-100>,
        "communication": <integer 0-100>,
        "confidence": <integer 0-100>,
        "relevance": <integer 0-100>
      }},
      "whatYouDidWell": ["<point 1>", "<point 2>"],
      "whereToImprove": ["<point 1>", "<point 2>"],
      "focusNext": ["<topic 1>", "<topic 2>"],
      "learningResources": [
        {{"title": "<Resource title>", "url": "<URL>"}}
      ],
      "questions": [
        {{
          "question": "<The question asked by the interviewer>",
          "userAnswer": "<Summary of what the user said AND feedback on why it was good/bad>",
          "score": <integer out of 10>,
          "maxScore": 10,
          "status": "<Strong | Fair | Partial | Needs work>"
        }}
      ]
    }}
    
    Ensure the JSON is valid and complete. Do NOT add any markdown formatting or text outside the JSON object.
    """

    chat_history = []
    for msg in request.messages:
        role = "Interviewer" if msg.role == "assistant" else "Candidate"
        chat_history.append(f"{role}: {msg.content}")
        
    prompt = "Conversation History:\n" + "\n".join(chat_history) + "\n\nPlease provide the comprehensive feedback report in JSON based on the above transcript."

    try:
        raw_response = generate_content(prompt, system_prompt=system_prompt, json_mode=True)
        
        import json
        feedback_data = json.loads(raw_response)
        return feedback_data

    except Exception as e:
        print("Groq API Error generating feedback:", e)
        raise HTTPException(status_code=500, detail="Failed to generate feedback")

