"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Loader2, Target, CheckCircle2, AlertCircle, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { addBookmark, removeBookmark, isBookmarked } from "@/lib/bookmark-tracker";
import { cn } from "@/lib/utils";
import { checkTrackCompletion } from "@/lib/activity-tracker";

export default function SubjectivePracticePage() {
  const router = useRouter();
  const [problem, setProblem] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [trackQuestions, setTrackQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const loadProblem = (parsedProblem: any) => {
    setProblem(parsedProblem);
    setBookmarked(isBookmarked(parsedProblem.title));
    setAnswer("");
    setResult(null);
    sessionStorage.setItem("current_subjective_problem", JSON.stringify(parsedProblem));
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("current_subjective_problem");
    const track = sessionStorage.getItem("projects_track");
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
      } catch (e) {}
    } else {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: problem.description, 
          user_answer: answer,
          context: problem.title 
        }),
      });

      if (!res.ok) throw new Error("Evaluation failed");

      const data = await res.json();
      setResult(data);

      try {
        const submissions = JSON.parse(localStorage.getItem("projects_submissions") || "[]");
        submissions.unshift({
          id: Date.now().toString(),
          problemTitle: problem.title,
          problemData: problem,
          answer,
          score: data.score,
          feedback: data.feedback,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem("projects_submissions", JSON.stringify(submissions));
        
        checkTrackCompletion("projects", trackQuestions, submissions);
      } catch (e) {
        console.error("Failed to save submission");
      }
    } catch (err) {
      alert("Failed to evaluate answer");
    } finally {
      setLoading(false);
    }
  };

  if (!problem) return null;

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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-4 bg-muted text-foreground">
      <div className="flex justify-between items-center px-2 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground mr-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{problem.title}</h2>
          {problem.company && (
            <span className="text-xs font-semibold px-2 py-1 bg-card rounded border border-border text-muted-foreground">
              {problem.company}
            </span>
          )}
          <button 
            onClick={() => {
              if (bookmarked) {
                removeBookmark(problem.title);
                setBookmarked(false);
              } else {
                addBookmark({
                  id: problem.title,
                  module: "Projects",
                  title: problem.title,
                  path: "/projects/practice",
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
        <div className="bg-background border border-border/50 rounded-xl flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
          <div className="p-6 border-b border-border/50">
            <h3 className="text-lg font-bold text-foreground mb-4">Question</h3>
            <p className="text-[15px] leading-relaxed text-muted-foreground font-serif whitespace-pre-wrap">
              {problem.description}
            </p>
          </div>
          
          {result && (
            <div className="p-6 bg-card/50 flex-1">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                AI Evaluation
              </h3>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl font-bold text-foreground">
                  {result.score}<span className="text-2xl text-zinc-600">/10</span>
                </div>
                <div>
                  {result.score >= 8 ? (
                    <div className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle2 className="w-4 h-4"/> Excellent</div>
                  ) : result.score >= 5 ? (
                    <div className="flex items-center gap-1 text-yellow-400 font-bold"><AlertCircle className="w-4 h-4"/> Average</div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-400 font-bold"><AlertCircle className="w-4 h-4"/> Needs Work</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Feedback</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-background p-4 rounded-lg border border-border/50">{result.feedback}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Ideal Answer</h4>
                  <p className="text-sm text-emerald-400/90 leading-relaxed bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">{result.ideal_answer}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-background border border-border/50 rounded-xl flex flex-col min-h-0 relative">
          <div className="p-4 border-b border-border/50 bg-card rounded-t-xl flex justify-between items-center">
            <span className="text-sm font-bold text-muted-foreground">Your Answer</span>
            <Button 
              size="sm" 
              onClick={handleSubmit}
              disabled={loading || !answer.trim() || !!result}
              className="bg-purple-600 hover:bg-purple-700 text-foreground"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Submit for Review
            </Button>
          </div>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={!!result}
            placeholder="Type your detailed explanation or proposal here..."
            className="flex-1 bg-transparent border-0 resize-none p-6 text-[15px] leading-relaxed text-foreground focus-visible:ring-0 rounded-b-xl"
          />
        </div>
      </div>
    </div>
  );
}
