"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Play, Send, Terminal, Clock, CheckCircle2, XCircle, Code2, ListChecks, Flag, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export default function MixedAssessmentPage() {
  const router = useRouter();
  
  const [assessment, setAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // State for user answers
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [reviews, setReviews] = useState<Record<number, any>>({});
  const [evaluatingQ, setEvaluatingQ] = useState<number | null>(null);
  
  // Test State
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Code execution state
  const [language, setLanguage] = useState("python");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<any[]>([]);

  useEffect(() => {
    const track = sessionStorage.getItem("mixed_assessment");
    if (track) {
      try {
        const data = JSON.parse(track);
        setAssessment(data);
        const combined = [...(data.coding_questions || []), ...(data.aptitude_questions || [])];
        setQuestions(combined);
        
        const savedState = sessionStorage.getItem("mixed_assessment_state");
        if (savedState) {
          const parsed = JSON.parse(savedState);
          if (parsed.answers) setAnswers(parsed.answers);
          if (parsed.timeLeft) setTimeLeft(parsed.timeLeft);
          if (parsed.attempts) setAttempts(parsed.attempts);
          if (parsed.reviews) setReviews(parsed.reviews);
        }
      } catch(e) {}
    } else {
      router.push("/mixed");
    }
  }, [router]);

  useEffect(() => {
    if (isSubmitted || !assessment) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, assessment]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (val: any) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: val }));
  };

  const handlePauseAndExit = () => {
    sessionStorage.setItem("mixed_assessment_state", JSON.stringify({
      answers,
      timeLeft,
      attempts,
      reviews
    }));
    router.push("/mixed");
  };

  const handleSubmitAssessment = async () => {
    setIsEvaluating(true);
    let currentScore = 0;
    
    // Auto-grade MCQs
    questions.forEach((q, idx) => {
      if (q.type === "mcq" && answers[idx] === q.correct_answer) {
        currentScore += 10;
      }
    });
    setScore(currentScore);

    // Evaluate Coding Questions
    const codingResults = [];
    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      if (q.type === "coding") {
        const code = answers[idx] || "";
        
        // Use existing review if available
        if (reviews[idx]) {
          codingResults.push({
            questionIndex: idx,
            title: q.title,
            is_correct: reviews[idx].is_correct,
            feedback: reviews[idx].feedback,
            optimal_code: reviews[idx].optimal_code,
            user_code: code
          });
          continue;
        }

        try {
          const res = await fetch("http://localhost:8000/api/dsa/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: q.title,
              description: q.description,
              code: code,
              language: language,
              attempts: 3 // Force AI to return optimal code
            })
          });
          const data = await res.json();
          codingResults.push({
            questionIndex: idx,
            title: q.title,
            is_correct: data.is_correct,
            feedback: data.feedback,
            optimal_code: data.optimal_code,
            user_code: code
          });
        } catch (e) {
          codingResults.push({
            questionIndex: idx,
            title: q.title,
            is_correct: false,
            feedback: "Evaluation failed.",
            optimal_code: null,
            user_code: code
          });
        }
      }
    }

    setEvaluationResults(codingResults);

    // Save history
    const history = JSON.parse(localStorage.getItem("mixed_submissions") || "[]");
    history.unshift({
        id: Date.now().toString(),
        company: sessionStorage.getItem("mixed_assessment_company"),
        score: currentScore,
        maxScore: questions.filter(q => q.type === "mcq").length * 10,
        codingResults,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem("mixed_submissions", JSON.stringify(history));

    sessionStorage.removeItem("mixed_assessment_state");
    sessionStorage.removeItem("mixed_assessment");
    
    setIsEvaluating(false);
    setIsSubmitted(true);
  };

  const handleReviewCode = async () => {
    const q = questions[currentIndex];
    if (!q || q.type !== "coding") return;
    
    const currentAttempts = attempts[currentIndex] || 0;
    if (currentAttempts >= 3) return;
    
    setEvaluatingQ(currentIndex);
    
    try {
      const code = answers[currentIndex] || "";
      const res = await fetch("http://localhost:8000/api/dsa/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: q.title,
          description: q.description,
          code: code,
          language: language,
          attempts: currentAttempts
        })
      });
      const data = await res.json();
      
      setReviews(prev => ({ ...prev, [currentIndex]: data }));
      setAttempts(prev => ({ ...prev, [currentIndex]: currentAttempts + 1 }));
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluatingQ(null);
    }
  };

  if (!assessment) return null;

  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col items-center p-8 bg-[#09090b] h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl w-full text-center mb-8 mt-8">
          <Flag className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">Assessment Completed</h2>
          <p className="text-zinc-400 mb-8">Your online assessment has been successfully submitted and evaluated by AI.</p>
          
          <div className="bg-[#18181b] border border-border/50 rounded-xl p-8 mb-8 inline-block min-w-[300px]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">Aptitude Score</h3>
            <div className="text-6xl font-bold text-emerald-400 mb-2">{score} <span className="text-2xl text-zinc-600">/ {questions.filter(q => q.type === "mcq").length * 10}</span></div>
          </div>
        </div>

        <div className="max-w-4xl w-full space-y-6 mb-12">
          <h3 className="text-xl font-bold text-white mb-4">Coding Evaluation</h3>
          {evaluationResults.map((res: any, idx: number) => (
            <Card key={idx} className="bg-[#111111] border-border/50">
              <CardHeader className="bg-[#18181b] border-b border-border/50 flex flex-row items-center justify-between p-4">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[var(--chart-1)]" /> {res.title}
                </CardTitle>
                <span className={cn("px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border", res.is_correct ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                  {res.is_correct ? "Correct" : "Incorrect"}
                </span>
              </CardHeader>
              <CardContent className="p-6 text-zinc-300 prose prose-invert max-w-none text-sm">
                <ReactMarkdown>{res.feedback}</ReactMarkdown>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Button onClick={() => router.push("/mixed")} className="bg-white text-black hover:bg-zinc-200 h-12 px-8 rounded-xl font-bold mb-12">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#09090b]">
      {/* AI Evaluating Overlay */}
      {isEvaluating && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
              <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
                  <h2 className="text-xl font-bold text-white">AI is evaluating your assessment...</h2>
                  <p className="text-zinc-400 mt-2">Grading MCQs and analyzing your coding logic.</p>
              </div>
          </div>
      )}
      {/* Top Header */}
      <div className="h-16 border-b border-border/50 bg-[#09090b] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePauseAndExit} className="text-zinc-400 hover:text-white shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold text-white">Online Assessment</h2>
          <span className="px-2 py-1 text-xs font-semibold bg-[#18181b] border border-border rounded text-zinc-400 hidden sm:inline-block">
            {sessionStorage.getItem("mixed_assessment_company")}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-[#111111]", timeLeft < 300 ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-zinc-300")}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          <Button onClick={handleSubmitAssessment} className="bg-[var(--chart-1)] hover:bg-[var(--chart-1)]/80 text-white font-bold h-10 px-6">
            Submit Assessment
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-border/50 bg-[#111111] flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b border-border/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Navigation</h3>
          </div>
          <div className="p-2 space-y-1">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[idx];
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                    currentIndex === idx 
                      ? "bg-[var(--chart-1)]/10 text-[var(--chart-1)]" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]",
                    isAnswered && currentIndex !== idx && "text-emerald-400"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {q.type === "coding" ? <Code2 className="w-4 h-4 shrink-0" /> : <ListChecks className="w-4 h-4 shrink-0" />}
                    <span className="truncate">Q{idx + 1}. {q.title}</span>
                  </div>
                  {isAnswered && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-4 gap-4 min-w-0">
          <div className="flex items-center gap-3 shrink-0">
            <h2 className="text-xl font-bold text-white">Question {currentIndex + 1}</h2>
            <span className={cn(
              "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border",
              currentQ.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
              currentQ.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
              "bg-red-500/10 text-red-500 border-red-500/20"
            )}>
              {currentQ.difficulty}
            </span>
            {currentQ.type === "mcq" && (
              <span className="text-xs font-semibold px-2 py-1 bg-[#18181b] rounded border border-border text-zinc-400">
                {currentQ.topic}
              </span>
            )}
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            {/* Left: Problem Statement */}
            <Card className="bg-[#111111] border-border/50 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
              <CardContent className="space-y-6 p-6">
                <p className="text-[15px] leading-relaxed text-zinc-300 whitespace-pre-wrap font-serif">
                  {currentQ.description}
                </p>

                {currentQ.type === "coding" && currentQ.examples && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-white">Examples</h4>
                    <div className="space-y-4">
                      {currentQ.examples.map((ex: any, i: number) => (
                        <div key={i} className="bg-[#18181b] border border-border/50 rounded-lg overflow-hidden">
                          <div className="p-4 space-y-3 text-sm font-mono text-zinc-300">
                            <div><span className="text-zinc-500 block text-xs font-bold mb-1">Input:</span><span className="text-emerald-400">{ex.input}</span></div>
                            <div><span className="text-zinc-500 block text-xs font-bold mb-1">Output:</span><span className="text-blue-400">{ex.output}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Code Editor OR MCQ Options */}
            {currentQ.type === "coding" ? (
              <div className="flex flex-col gap-4 min-h-0">
                <Card className="bg-[#111111] border-border/50 flex-1 flex flex-col min-h-0 relative overflow-hidden">
                  <div className="absolute top-0 w-full flex justify-between items-center p-2 bg-[#18181b] border-b border-border/50 z-10">
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-[#09090b] border border-border/50 text-xs text-zinc-300 rounded px-2 py-1"
                    >
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                    <span className="text-xs text-zinc-500 font-medium px-2">Write Logic or Pseudo-code</span>
                  </div>
                  <div className="flex-1 mt-10">
                    <Editor
                      height="100%"
                      language={language}
                      theme="vs-dark"
                      value={answers[currentIndex] || ""}
                      onChange={(val) => handleAnswer(val || "")}
                      options={{ minimap: { enabled: false }, fontSize: 14 }}
                    />
                  </div>
                  <div className="p-3 bg-[#18181b] border-t border-border/50 flex justify-between items-center z-10">
                    <span className="text-xs text-zinc-400 font-medium">Attempts remaining: <span className="text-white font-bold">{3 - (attempts[currentIndex] || 0)}</span></span>
                    <Button 
                      onClick={handleReviewCode} 
                      disabled={evaluatingQ === currentIndex || (attempts[currentIndex] || 0) >= 3 || !(answers[currentIndex]?.trim())}
                      className="bg-[var(--chart-1)] hover:bg-[var(--chart-1)]/80 text-white font-bold h-9 px-4 text-xs"
                    >
                      {evaluatingQ === currentIndex ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      Run & Evaluate
                    </Button>
                  </div>
                </Card>
                {reviews[currentIndex] && (
                  <Card className="bg-[#111111] border-border/50 max-h-[300px] flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                    <CardHeader className="bg-[#18181b] border-b border-border/50 p-3 sticky top-0 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[var(--chart-1)]" /> AI Feedback
                      </CardTitle>
                      <span className={cn("px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border", reviews[currentIndex].is_correct ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                        {reviews[currentIndex].is_correct ? "Passed" : "Failed"}
                      </span>
                    </CardHeader>
                    <CardContent className="p-4 text-zinc-300 prose prose-invert max-w-none text-sm">
                      <ReactMarkdown>{reviews[currentIndex].feedback}</ReactMarkdown>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-[#111111] border-border/50 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                <CardHeader className="bg-[#18181b] border-b border-border/50 sticky top-0 z-10 p-4">
                  <CardTitle className="text-sm text-zinc-300 uppercase tracking-wider font-semibold">Select your answer</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {currentQ.options?.map((option: string, idx: number) => {
                    const isSelected = answers[currentIndex] === option;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        className={cn(
                          "w-full text-left px-5 py-4 rounded-xl border transition-all",
                          isSelected 
                            ? "bg-[var(--chart-1)]/10 border-[var(--chart-1)]/50 text-[var(--chart-1)] font-medium" 
                            : "bg-[#18181b] hover:bg-zinc-800 border-border/50 text-zinc-300"
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
