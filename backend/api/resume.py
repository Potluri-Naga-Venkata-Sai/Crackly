from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from resume.parser import resume_parser

router = APIRouter(prefix="/api/resume", tags=["Resume"])

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        content = await file.read()
        parsed_text = resume_parser.parse_pdf(content)
        result = resume_parser.generate_interview_questions(parsed_text)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/extract-text")
async def extract_resume_text(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        content = await file.read()
        parsed_text = resume_parser.parse_pdf(content)
        return {"text": parsed_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/prepare")
async def prepare_resume(
    file: UploadFile = File(...),
    job_description: str = Form(None)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        content = await file.read()
        parsed_text = resume_parser.parse_pdf(content)
        result = resume_parser.generate_interactive_preparation(parsed_text, job_description)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
