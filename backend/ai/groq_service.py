import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class GroqService:
    def __init__(self):
        # Initialize Groq client. Expects GROQ_API_KEY in environment.
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"

    def evaluate_answer(self, question: str, transcript: str):
        prompt = f"""
        You are an expert technical interviewer.
        
        Question asked to candidate: "{question}"
        Candidate's answer (from speech-to-text): "{transcript}"
        
        Evaluate this answer out of 10 for:
        - Technical Accuracy
        - Communication
        - Completeness
        
        Provide constructive feedback, identify missing concepts, and provide an ideal concise answer.
        Output MUST be in valid JSON format with keys: 
        accuracy_score, communication_score, completeness_score, feedback, missing_concepts, ideal_answer.
        """
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a senior technical recruiter and evaluator. Always output pure JSON."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            return response.choices[0].message.content
        except Exception as e:
            return {"error": str(e)}

groq_service = GroqService()
