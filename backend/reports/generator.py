from datetime import datetime
from pydantic import BaseModel

class InterviewReport(BaseModel):
    user_id: str
    interview_type: str
    overall_score: int
    communication_score: int
    confidence_score: int
    technical_score: int
    hr_score: int
    sql_score: int
    weak_areas: list[str]
    improvement_suggestions: list[str]
    generated_at: str

class ReportGenerator:
    def __init__(self):
        pass

    def generate_report(self, session_data: dict) -> InterviewReport:
        # In a full implementation, this would aggregate scores from the database (interview_answers table)
        # For now, we simulate the aggregation logic based on the session data
        
        report = InterviewReport(
            user_id=session_data.get("user_id", "anonymous"),
            interview_type=session_data.get("interview_type", "Comprehensive"),
            overall_score=82,
            communication_score=8,
            confidence_score=7,
            technical_score=9,
            hr_score=8,
            sql_score=7,
            weak_areas=["Time Complexity Analysis", "Eye contact consistency"],
            improvement_suggestions=[
                "Practice explaining Big-O notation verbally.",
                "Look directly at the camera when speaking to simulate eye contact."
            ],
            generated_at=datetime.utcnow().isoformat()
        )
        return report

report_generator = ReportGenerator()
