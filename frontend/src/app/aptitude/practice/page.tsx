"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Loader2, CheckCircle2, XCircle, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logActivity, checkTrackCompletion } from "@/lib/activity-tracker";
import { addBookmark, removeBookmark, isBookmarked } from "@/lib/bookmark-tracker";

export default function AptitudePracticePage() {
  const router = useRouter();
  const [problem, setProblem] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [trackQuestions, setTrackQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const loadProblem = (parsedProblem: any) => {
    setProblem(parsedProblem);
    setBookmarked(isBookmarked(parsedProblem.title));
    setSelectedOption(null);
    setIsEvaluated(false);
    sessionStorage.setItem("current_aptitude_problem", JSON.stringify(parsedProblem));
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("current_aptitude_problem");
    const track = sessionStorage.getItem("aptitude_track");
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
      router.push("/aptitude");
    }
  }, [router]);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsEvaluated(true);
    
    const isCorrect = selectedOption === problem.correct_answer;
    
    // Save submission to local storage
    try {
      const submissions = JSON.parse(localStorage.getItem("aptitude_submissions") || "[]");
      submissions.unshift({
        id: Date.now().toString(),
        problemTitle: problem.title,
        problemData: problem,
        selectedOption,
        isCorrect,
        score: isCorrect ? 100 : 0, // 100 for correct, 0 for incorrect
        timestamp: new Date().toISOString()
      });
      localStorage.setItem("aptitude_submissions", JSON.stringify(submissions));
      
      checkTrackCompletion("aptitude", trackQuestions, submissions);
    } catch (e) {
      console.error("Failed to save submission");
    }

    logActivity({
      module: "Aptitude",
      title: "Aptitude Practice Question",
      score: isCorrect ? "1/1" : "0/1",
      description: `Attempted: ${problem.title}. Result: ${isCorrect ? "Correct" : "Incorrect"}.`
    });
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
          <Link href="/aptitude" className="text-muted-foreground hover:text-foreground mr-2">
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
          <button 
            onClick={() => {
              if (bookmarked) {
                removeBookmark(problem.title);
                setBookmarked(false);
              } else {
                addBookmark({
                  id: problem.title,
                  module: "Aptitude",
                  title: problem.title,
                  difficulty: problem.difficulty,
                  path: "/aptitude/practice",
                  problemData: problem
                });
                setBookmarked(true);
              }
            }} 
            className="ml-2 p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
          >
            {bookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-emerald-500" />
            ) : (
              <Bookmark className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            )}
          </button>
          <span className="text-xs font-semibold px-2 py-1 bg-card rounded border border-border text-muted-foreground">
            {problem.company}
          </span>
          
          {trackQuestions.length > 0 && (
            <div className="flex items-center gap-1 ml-4 bg-card border border-border/50 rounded-lg p-1">
              <button 
                onClick={handlePrev} 
                disabled={currentIndex <= 0}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-muted-foreground px-2">{currentIndex + 1} / {trackQuestions.length}</span>
              <button 
                onClick={handleNext}
                disabled={currentIndex >= trackQuestions.length - 1}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-0">
        {/* Left Side: Problem Statement */}
        <Card className="bg-background border-border/50 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Problem Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <p className="text-[15px] leading-relaxed text-muted-foreground whitespace-pre-wrap font-serif">
              {problem.description}
            </p>
          </CardContent>
        </Card>

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
                    bgClass = "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"; // Correct answer is always green
                  } else if (isSelected) {
                    bgClass = "bg-red-500/10 border-red-500/50 text-red-400"; // Wrong selected answer is red
                  } else {
                    bgClass = "bg-card border-border/20 text-zinc-600 opacity-50"; // Unselected wrong answers dim
                  }
                } else if (isSelected) {
                  bgClass = "bg-orange-500/10 border-orange-500/50 text-orange-400"; // Selected before eval is orange
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
                    <span className="font-medium">{option}</span>
                    {isEvaluated && option === problem.correct_answer && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {isEvaluated && isSelected && option !== problem.correct_answer && <XCircle className="w-5 h-5 text-red-500" />}
                  </button>
                );
              })}

              {!isEvaluated ? (
                <div className="pt-6">
                  <Button 
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-foreground font-bold h-12 text-lg rounded-xl"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Submit Answer
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
