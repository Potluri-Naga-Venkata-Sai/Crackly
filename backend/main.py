from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()


from api.challenge import router as challenge_router
from api.resume import router as resume_router
from api.dsa import router as dsa_router
from api.sql import router as sql_router
from api.aptitude import router as aptitude_router
from api.mcq import router as mcq_router
from api.mixed import router as mixed_router
from api.english import router as english_router
from api.theory import router as theory_router
from api.tools import router as tools_router
from api.evaluate import router as evaluate_router
from api.projects import router as projects_router
from api.system import router as system_router
from api.company import router as company_router
from api.interview import router as interview_router
from api.chat import router as chat_router

app = FastAPI(
    title="Crackly API",
    description="Backend API for the Crackly Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(challenge_router)
app.include_router(resume_router)
app.include_router(dsa_router)
app.include_router(sql_router)
app.include_router(aptitude_router)
app.include_router(mcq_router)
app.include_router(mixed_router)
app.include_router(english_router)
app.include_router(theory_router)
app.include_router(tools_router)
app.include_router(evaluate_router)
app.include_router(projects_router)
app.include_router(system_router)
app.include_router(company_router)
app.include_router(interview_router)
app.include_router(chat_router)

@app.get("/")
def read_root():
    return {"status": "Crackly API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
