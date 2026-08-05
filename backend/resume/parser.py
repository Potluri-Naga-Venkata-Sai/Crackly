import io
import json
import os
from pypdf import PdfReader
from groq import Groq

class ResumeParser:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"

    def parse_pdf(self, pdf_bytes: bytes):
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

    def generate_interview_questions(self, resume_text: str):
        prompt = f"""
        You are a senior technical recruiter. Extract the following from this resume:
        - Skills
        - Projects
        - Experience
        
        Then, generate exactly 5 highly personalized technical/behavioral interview questions based specifically on the projects and skills mentioned in the resume.
        
        Output MUST be in valid JSON format with exactly these keys:
        - "skills": list of strings
        - "projects": list of strings
        - "questions": list of 5 strings
        CRITICAL: Do NOT wrap the JSON in Markdown code blocks (e.g. ```json ... ```). Output RAW valid JSON.
        
        Resume Text:
        {resume_text}
        """
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You output only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return {"error": str(e)}
            
    def generate_interactive_preparation(self, resume_text: str, job_description: str = None):
        jd_instruction = ""
        if job_description and job_description.strip():
            jd_instruction = f"""
        Additionally, the user has provided a target Job Description.
        - Analyze the gap between the Resume and the Job Description.
        - Output a "jdMatchScore" (integer 0-100) representing how well the resume matches the JD.
        - Provide "jdSuggestions" (list of strings): 3-5 specific, actionable suggestions on what to add, remove, or emphasize in the resume to better align with the JD and pass ATS parsers.
        
        Job Description:
        {job_description}
        """

        prompt = f"""
        You are an expert career coach and technical interviewer. Analyze the following resume text.
        
        First, provide a holistic review of the resume. 
        - "overallReview": A personalized paragraph analyzing the strengths and weaknesses of the resume format and content.
        - "improvementTips": A list of 3-5 actionable tips to improve the resume.
        {jd_instruction}
        
        CRITICAL INSTRUCTION: You MUST generate a massive, exhaustive list of flashcard entries. 
        - You MUST generate AT LEAST 25 to 50 distinct flashcard entries total. 
        - DO NOT stop at 5 or 6 questions. If you output less than 25 entries, you have failed your instructions.
        - You must generate MULTIPLE distinct flashcard entries for EACH keyword/topic (e.g., for the keyword "React.js", generate several separate entries covering all frequently asked interview questions like state management, performance, component lifecycle). 
        - Follow this exhaustive rule for the entire resume: projects, past experience roles, certifications, education, and technical skills. Keep generating entries until you have covered all possible relevant interview questions for the entire resume.
        
        For EACH flashcard entry, provide:
        1. A "keyword" (the skill, project, or role being tested).
        2. A "category" (e.g., Skill, Project, Work Experience, Certification).
        3. A "briefExplanation": A clear explanation of the specific concept tested in this question.
        4. A "realLifeExample": A brief scenario of how the user applied this, based on their resume.
        5. An "interviewStrategy": A tip on how to talk about this to impress the interviewer.
        6. A "sampleQuestion": ONE frequently asked interview question (since you are making multiple entries per keyword, each entry gets a different question).
        7. An "answerGuide": A short guide on how to structure the answer.
        8. A "sampleAnswer": A highly detailed, elaborate, STAR-method sample answer (first-person) with concrete examples.
        
        Output MUST be in valid JSON format matching exactly this structure:
        {{
          "overallReview": "Your resume is strong in frontend technologies, but it lacks clear metrics to demonstrate the impact of your work.",
          "improvementTips": [
            "Add quantifiable metrics to your experience bullet points.",
            "Include live links to the projects mentioned."
          ],
          "jdMatchScore": 85,
          "jdSuggestions": [
            "Emphasize your experience with AWS as it is mentioned multiple times in the JD.",
            "Add the exact keyword 'Agile Methodology' to your skills section."
          ],
          "keywords": [
            {{
              "keyword": "React.js",
              "category": "Frontend Framework",
              "briefExplanation": "React is a JavaScript library for building user interfaces using reusable components. Example: building single-page applications like Facebook or Instagram.",
              "realLifeExample": "Building high-performance, real-time dashboards for enterprise clients.",
              "interviewStrategy": "Focus on explaining how you optimized component re-renders using useMemo in your E-commerce project.",
              "sampleQuestion": "Can you walk me through a time you had to debug a complex state management issue in React?",
              "answerGuide": "Start by explaining the specific state issue (e.g., unnecessary re-renders). Then, discuss how you identified it using React DevTools, and how you fixed it.",
              "sampleAnswer": "In my previous role, we had a dashboard that was rendering too slowly when live data was pushed. I used React DevTools to profile the app and found that the entire list component was re-rendering unnecessarily. I implemented useMemo for the expensive calculations and wrapped the child components in React.memo. This reduced our render time by 40%."
            }}
          ]
        }}
        CRITICAL: Do NOT wrap the JSON in Markdown code blocks (e.g. ```json ... ```). Output RAW valid JSON.
        
        Resume Text:
        {resume_text}
        """
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You output only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print("Groq Error:", e)
            return {"error": str(e)}

resume_parser = ResumeParser()
