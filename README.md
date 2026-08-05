# AI Interviewer Platform 🚀

A comprehensive, AI-powered interview preparation platform designed to help candidates master Coding, SQL, Aptitude, System Design, and behavioral interviews. Featuring real-time voice-to-voice mock interviews, automated code evaluation, and a personalized dashboard to track progress.

## 🌟 Key Features

- **Voice-to-Voice Mock Interviews:** Conduct fully proctored mock interviews with an AI that listens to your audio, evaluates your resume, and asks real-time technical questions.
- **10+ Assessment Modules:** Dedicated practice tracks for Coding (DSA), SQL, Aptitude, English, MCQ, Theory, Projects, System Design, Company-specific OAs, and Tools.
- **Smart Progress Tracking:** A sleek dashboard that automatically tracks your completed modules, bookmarks, and recent activity.
- **Automated Code Evaluation:** Submit Python/C++ code and receive instant AI-driven feedback, optimization hints, and space/time complexity analysis.
- **AI Hints:** Get intelligent hints when stuck on a problem without giving away the exact solution.

## 🛠 Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons, Framer Motion
- **Backend:** FastAPI (Python), Uvicorn
- **AI & Integrations:** OpenAI (GPT-4o), Google Gemini, Whisper (Speech-to-Text), PlayHT (Text-to-Speech)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- API Keys for OpenAI and Gemini

### 1. Backend Setup (FastAPI)

Navigate to the backend directory and set up the Python environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables:**
Create a `.env` file inside the `backend/` directory (you can copy `.env.example` if it exists) and add your keys:
```env
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
PLAYHT_USER_ID=your_playht_user_id
PLAYHT_API_KEY=your_playht_api_key
```

**Run the Backend Server:**
```bash
uvicorn main:app --reload
```
The backend API will start on `http://localhost:8000`.

### 2. Frontend Setup (Next.js)

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend

# Install dependencies
npm install
```

**Environment Variables:**
Create a `.env` file inside the `frontend/` directory (you can copy `.env.example`) and add your keys if necessary:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Run the Frontend Development Server:**
```bash
npm run dev
```
The platform will be available at `http://localhost:3000`.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
