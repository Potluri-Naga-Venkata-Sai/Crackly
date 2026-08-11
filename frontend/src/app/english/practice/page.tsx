"use client";

import { checkTrackCompletion } from "@/lib/activity-tracker";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Loader2, CheckCircle2, XCircle, Lightbulb, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { saveSubmissionLocallyAndToCloud } from "@/lib/supabase";

export default function EnglishPracticePage() {
  const router = useRouter();
  const [problem, setProblem] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question

  const [trackQuestions, setTrackQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const loadProblem = (parsedProblem: any) => {
    setProblem(parsedProblem);
    setIsEvaluated(false);
    setShowHint(false);
    setSelectedOption(null);
    setTimeLeft(120);
    sessionStorage.setItem("current_english_problem", JSON.stringify(parsedProblem));
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("current_english_problem");
    const track = sessionStorage.getItem("english_track");
    if (stored) {
      try {
        const parsedProblem = JSON.parse(stored);
        loadProblem(parsedProblem);
        
        if (track) {
            const parsedTrack = JSON.parse(track);
            setTrackQuestions(parsedTrack);
            const idx = parsedTrack.findIndex((q: any) => q.title === parsedProblem.title);
            setCurrentIndex(idx);
        }
      } catch (e) {
        console.error("Failed to parse problem");
      }
    } else {
      router.push("/english");
    }
  }, [router]);

  useEffect(() => {
    if (isEvaluated || !problem) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isEvaluated, problem]);

  const handleSubmit = () => {
    if (!selectedOption && timeLeft > 0) return;
    setIsEvaluated(true);

    const isCorrect = selectedOption === problem.correct_answer;
    
    // Save submission to local storage
    try {
      const submissions = JSON.parse(localStorage.getItem("english_submissions") || "[]");
      const newSubmission = {
        id: Date.now().toString(),
        problemTitle: problem.title,
        problemData: problem,
        selectedOption,
        isCorrect,
        score: isCorrect ? 100 : 0,
        timestamp: new Date().toISOString()
      };
      
      saveSubmissionLocallyAndToCloud("english", newSubmission);
      checkTrackCompletion("english", trackQuestions, [newSubmission, ...submissions]);
    } catch (e) {
      console.error("Failed to save submission");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleNext = () => {
    if (currentIndex < trackQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      loadProblem(trackQuestions[nextIdx]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      loadProblem(trackQuestions[prevIdx]);
    }
  };

  if (!problem) {
    return <div className="flex-1 flex items-center justify-center h-full"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  const isCorrect = selectedOption === problem.correct_answer;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-4 bg-muted text-foreground">
      <div className="flex justify-between items-center px-2 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/mcq" className="text-muted-foreground hover:text-foreground mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{problem.title}</h2>
          <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${
            problem.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
            problem.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
            "bg-red-500/10 text-red-500 border-red-500/20"
          }`}>
            {problem.difficulty}
          </span>
          <span className={cn("text-xs font-semibold px-2 py-1 rounded border border-border", problem.company === "Personalized" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-card text-muted-foreground")}>
            {problem.company}
          </span>
          
          {trackQuestions.length > 0 && (
            <div className="flex items-center gap-2 ml-4 bg-card border border-border/50 rounded-lg p-1">
              <button 
                onClick={handlePrev} 
                disabled={currentIndex <= 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <span className="text-xs font-bold text-muted-foreground px-2 border-l border-r border-border/50">{currentIndex + 1} / {trackQuestions.length}</span>
              <button 
                onClick={handleNext}
                disabled={currentIndex >= trackQuestions.length - 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-background", timeLeft < 30 ? "text-red-400 border-red-500/30" : "text-muted-foreground")}>
          <Clock className="w-4 h-4" />
          <span className="font-mono font-bold text-sm">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-0">
        {/* Left Side: Problem Statement & Hint */}
        <div className="flex flex-col gap-4 min-h-0">
          <Card className="bg-background border-border/50 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              <p className="text-[15px] leading-relaxed text-muted-foreground whitespace-pre-wrap font-serif">
                {problem.description}
              </p>
            </CardContent>
          </Card>

          {/* AI Hint Section */}
          <Card className="bg-background border-border/50 shrink-0">
            <CardContent className="p-4 flex flex-col gap-3">
              {!showHint ? (
                <Button 
                  variant="outline" 
                  className="w-full bg-card border-border/50 hover:bg-zinc-800 text-purple-400 hover:text-purple-300"
                  onClick={() => setShowHint(true)}
                  disabled={isEvaluated}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Stuck? Ask AI for a Hint
                </Button>
              ) : (
                <div className="animate-in fade-in zoom-in-95 bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-purple-400">
                    <Lightbulb className="w-4 h-4" />
                    <span className="font-bold text-sm">AI Hint</span>
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">{problem.hint}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Options & Evaluation */}
        <div className="flex flex-col gap-4 min-h-0">
          <Card className="bg-background border-border/50 flex-1 flex flex-col min-h-0 relative overflow-y-auto custom-scrollbar">
            <CardHeader className="bg-card border-b border-border/50 sticky top-0 z-10 p-4">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Select your answer</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {problem.options.map((option: string, idx: number) => {
                const isSelected = selectedOption === option;
                let bgClass = "bg-card hover:bg-zinc-800 border-border/50 text-muted-foreground";
                
                if (isEvaluated) {
                  if (option === problem.correct_answer) {
                    bgClass = "bg-emerald-500/10 border-emerald-500/50 text-emerald-400";
                  } else if (isSelected) {
                    bgClass = "bg-red-500/10 border-red-500/50 text-red-400";
                  } else {
                    bgClass = "bg-card border-border/20 text-zinc-600 opacity-50";
                  }
                } else if (isSelected) {
                  bgClass = "bg-purple-500/10 border-purple-500/50 text-purple-400";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !isEvaluated && setSelectedOption(option)}
                    disabled={isEvaluated}
                    className={cn(
                      "w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between",
                      bgClass,
                      isEvaluated && "cursor-default"
                    )}
                  >
                    <span className="font-medium text-[15px]">{option}</span>
                    {isEvaluated && option === problem.correct_answer && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {isEvaluated && isSelected && option !== problem.correct_answer && <XCircle className="w-5 h-5 text-red-500" />}
                  </button>
                );
              })}

              {!isEvaluated ? (
                <div className="pt-6">
                  <Button 
                    onClick={handleSubmit}
                    disabled={!selectedOption && timeLeft > 0}
                    className={cn(
                      "w-full font-bold h-12 text-lg rounded-xl text-foreground",
                      timeLeft === 0 ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
                    )}
                  >
                    {timeLeft === 0 ? "Time's Up! See Answer" : <><Send className="w-5 h-5 mr-2" /> Submit Answer</>}
                  </Button>
                </div>
              ) : (
                <div className="pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className={cn(
                    "p-4 rounded-xl border mb-6",
                    isCorrect ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
                  )}>
                    <h3 className={cn("text-lg font-bold flex items-center gap-2", isCorrect ? "text-emerald-400" : "text-red-400")}>
                      {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      {isCorrect ? "Correct! Brilliant job." : "Incorrect. Let's look at the solution."}
                    </h3>
                  </div>

                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">AI Explanation</h3>
                  <div className="bg-card border border-border/50 rounded-xl p-5">
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                      {problem.explanation}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
