from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from api.llm_client import generate_content
from resume.parser import resume_parser

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/ask")
async def ask_bot(prompt: str = Form(...), file: Optional[UploadFile] = File(None)):
    if not prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
    system_prompt = """
    You are an intelligent AI coding assistant and tech mentor. 
    You are embedded directly into a mock interview and learning dashboard.
    Users will ask you questions about programming languages, interview preparation, tools, system design, or any subject.
    Answer concisely, accurately, and use markdown for code snippets or formatting.
    Be encouraging and supportive.
    """
    
    file_context = ""
    if file:
        try:
            content = await file.read()
            if file.content_type == "application/pdf":
                extracted_text = resume_parser.parse_pdf(content)
                file_context = f"\n\n[USER PROVIDED FILE ATTACHMENT ({file.filename})]\n{extracted_text}\n\nPlease base your answer on the document above if relevant."
            else:
                extracted_text = content.decode("utf-8", errors="ignore")
                file_context = f"\n\n[USER PROVIDED FILE ATTACHMENT ({file.filename})]\n{extracted_text}\n\nPlease base your answer on the document above if relevant."
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    full_prompt = prompt + file_context
    
    try:
        response_text = generate_content(
            prompt=full_prompt,
            system_prompt=system_prompt,
            json_mode=False
        )
        return {"answer": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
