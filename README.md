# Crackly: AI-Powered Interview Preparation Platform 🚀

Crackly is a comprehensive, state-of-the-art AI Interviewer Platform designed to help candidates prepare for real-world technical and behavioral interviews. It provides an immersive environment featuring Voice-to-Voice mock interviews, automated code evaluation, and a personalized dashboard to track your progress seamlessly across your devices.

## 🌟 Key Features

### Immersive AI Mock Interviews
- **Voice-to-Voice AI:** Conduct fully proctored mock interviews with an AI that listens to your audio, evaluates your resume dynamically, and asks real-time technical questions.
- **Resume Parsing:** Automatically generate personalized interview tracks by simply uploading your resume.

### 10+ Assessment Modules
- **Coding (DSA):** Practice Data Structures & Algorithms with an integrated IDE, AI hints, and automated space/time complexity evaluation.
- **SQL:** Test your database querying skills with schema-based scenario questions.
- **System Design:** Dive deep into High-Level Design (HLD) and Low-Level Design (LLD) architectural problems.
- **Other Tracks:** Includes Aptitude, English, MCQs, Theory, Project Evaluation, Company-specific OAs, and Developer Tools.

### Smart Progress Tracking (Supabase Integration)
- **Seamless Syncing:** Every track generated and every submission made is instantly synchronized to the cloud via **Supabase**.
- **Persistent History:** Log out, switch devices, or refresh the page—your progress and history will securely persist across sessions.
- **Dashboard:** A sleek dashboard tracks your recent activity, active bookmarks, and total modules completed.

### Curated Job Board
- **Jobs & Opportunities:** Discover the latest tailored job postings natively built into the platform to help you land your dream role.

---

## 🛠 Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons, Framer Motion
- **Backend:** FastAPI (Python), Uvicorn
- **Database & Auth:** Supabase (PostgreSQL, GoTrue Auth)
- **AI & Audio:** OpenAI (GPT-4o), Google Gemini, Whisper (Speech-to-Text), PlayHT (Text-to-Speech)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- API Keys for OpenAI and Gemini
- A Supabase Project (Database & Authentication)

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
Create a `.env` file inside the `backend/` directory and add your keys:
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
Create a `.env.local` file inside the `frontend/` directory and add your Supabase credentials:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Database Setup:**
Ensure your Supabase project contains the `tracks` and `submissions` tables, and that Email Auth is enabled in the Supabase dashboard.

**Run the Frontend Development Server:**
```bash
npm run dev
```
The platform will be available at `http://localhost:3000`.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
