from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/challenge", tags=["Challenge"])

class DailyTask(BaseModel):
    id: str
    title: str
    description: str
    type: str # 'coding', 'sql', 'hr', 'resume'
    is_completed: bool

class ChallengeProgress(BaseModel):
    current_day: int
    total_days: int = 30
    tasks_today: List[DailyTask]
    overall_score: int

@router.get("/progress/{user_id}", response_model=ChallengeProgress)
def get_challenge_progress(user_id: str):
    # Simulated database fetch for the user's current challenge day and tasks
    # In a real app, this queries the `challenge_progress` Supabase table
    
    return ChallengeProgress(
        current_day=0,
        tasks_today=[],
        overall_score=0
    )

@router.post("/complete-task/{task_id}")
def complete_task(task_id: str, user_id: str):
    # Logic to update the Supabase `challenge_progress` table
    return {"status": "success", "message": f"Task {task_id} marked as completed for user {user_id}"}
