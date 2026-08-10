"use client";

import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Send, CheckCircle2, ArrowLeft, Loader2, XCircle, Bookmark, BookmarkCheck, CameraOff, Sparkles, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logActivity, checkTrackCompletion } from "@/lib/activity-tracker";
import { addBookmark, removeBookmark, isBookmarked } from "@/lib/bookmark-tracker";
import { saveSubmissionLocallyAndToCloud } from "@/lib/supabase";

export default function CodingPracticePage() {
  const router = useRouter();
  const [language, setLanguage] = useState("sql");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [problem, setProblem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [activeTab, setActiveTab] = useState<number>(0);
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [reviewData, setReviewData] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [trackQuestions, setTrackQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const setupProblem = (prob: any) => {
      setIsSettingUp(true);
      setLanguage("sql");
      setCode("-- Write your SQL logic or query structure here...\n-- Focus on the joins, subqueries, and grouping.\n");
      setIsSettingUp(false);
  };

  const loadProblem = (parsedProblem: any) => {
      setProblem(parsedProblem);
      setBookmarked(isBookmarked(parsedProblem.title));
      setCode("");
      setOutput("");
      setReviewData(null);
      setAttempts(0);
      setActiveTab(0);
      sessionStorage.setItem("current_sql_problem", JSON.stringify(parsedProblem));
      setupProblem(parsedProblem);
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("current_sql_problem");
    const track = sessionStorage.getItem("sql_track");
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
      router.push("/sql");
    }

    // Initialize Webcam
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied or failed", err);
        setCameraError(true);
      }
    };
    startCamera();



    // Anti-Cheat disabled for testing purposes
    // window.addEventListener("keydown", blockShortcuts);
    // window.addEventListener("copy", blockClipboard);
    // window.addEventListener("paste", blockClipboard);
    // window.addEventListener("cut", blockClipboard);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      // window.removeEventListener("keydown", blockShortcuts);
      // window.removeEventListener("copy", blockClipboard);
      // window.removeEventListener("paste", blockClipboard);
      // window.removeEventListener("cut", blockClipboard);
    };
  }, [router]);

  // Removed handleLanguageChange

  const submitCode = async () => {
    setIsReviewing(true);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sql/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: problem.title,
                description: problem.description,
                language,
                code,
                attempts: newAttempts
            })
        });
        const data = await res.json();
        setReviewData(data.feedback);
        
        const submissions = JSON.parse(localStorage.getItem("sql_submissions") || "[]");
        const newSubmission = {
            id: Date.now().toString(),
            problemTitle: problem.title,
            problemData: problem,
            language,
            code: finalCodeToSave,
            score: data.is_correct ? 100 : 0,
            timestamp: new Date().toISOString()
        };

        await saveSubmissionLocallyAndToCloud("sql", newSubmission);

        logActivity({
            module: "Coding",
            title: "Coding Challenge Submitted",
            description: `Submitted solution for ${problem.title} in ${language}.`,
        });
        checkTrackCompletion("sql", trackQuestions, [newSubmission, ...submissions]);
    } catch (e) {
        console.error("Failed to evaluate code optimally", e);
        alert("Failed to review code.");
    } finally {
        setIsReviewing(false);
    }
  };

  const toggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(problem.title);
      setBookmarked(false);
    } else {
      addBookmark({
        id: problem.title,
        module: "Coding",
        title: problem.title,
        difficulty: problem.difficulty,
        path: "/sql/practice",
        problemData: problem
      });
      setBookmarked(true);
    }
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



  return (
    <div 
      className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-4 bg-muted text-foreground select-none relative"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex justify-between items-center px-2 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/sql" className="text-muted-foreground hover:text-foreground mr-2">
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
          <span className="text-xs font-semibold px-2 py-1 bg-card rounded border border-border text-muted-foreground">
            {problem.company}
          </span>
          <button onClick={toggleBookmark} className="ml-2 p-1.5 rounded-md hover:bg-zinc-800 transition-colors">
            {bookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-emerald-500" />
            ) : (
              <Bookmark className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            )}
          </button>
          
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
        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            onClick={submitCode} 
            disabled={isReviewing}
            className="bg-purple-600 hover:bg-purple-700 text-foreground font-medium">
            <Send className="w-4 h-4 mr-2" />
            {attempts >= 2 ? "Get Optimal Solution" : `Submit & Evaluate (Attempt ${attempts + 1}/3)`}
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-0">
        {/* Left Side: Problem Statement */}
        <Card className="bg-background border-border/50 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Problem Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {problem.description}
            </p>
            
            {problem.examples && problem.examples.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground">Examples</h4>
                <div className="space-y-4">
                  {problem.examples.map((ex: any, i: number) => (
                    <div key={i} className="bg-card border border-border/50 rounded-lg overflow-hidden">
                      <div className="bg-background px-4 py-2 border-b border-border/50 flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">Example {i + 1}</span>
                      </div>
                      <div className="p-4 space-y-3 text-sm font-mono text-muted-foreground">
                        <div>
                          <span className="text-muted-foreground block text-xs font-bold mb-1">Input:</span> 
                          <span className="text-emerald-400 whitespace-pre-wrap block overflow-x-auto">{ex.input}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs font-bold mb-1">Output:</span> 
                          <span className="text-blue-400 whitespace-pre-wrap block overflow-x-auto">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="pt-2 border-t border-border/50">
                            <span className="text-muted-foreground block text-xs font-bold mb-1 font-sans">Explanation:</span> 
                            <span className="text-muted-foreground font-sans text-sm">{ex.explanation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {problem.constraints && problem.constraints.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground">Constraints</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {problem.constraints.map((c: string, i: number) => (
                    <li key={i} className="font-mono text-xs">{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side: Code Editor & Terminal */}
        <div className="flex flex-col gap-4 min-h-0">
          <Card className="bg-background border-border/50 flex-1 flex flex-col min-h-0 relative overflow-hidden">
            <div className="absolute top-0 w-full flex justify-between items-center p-2 bg-card border-b border-border/50 z-10">
              <span className="text-xs text-muted-foreground font-bold px-2">SQL Editor</span>
            </div>
            <div className="flex-1 mt-10">
              <Editor
                height="100%"
                language="sql"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  contextmenu: false,
                  copyWithSyntaxHighlighting: false,
                }}
              />
            </div>
          </Card>
          

        </div>
      </div>

      {/* AI Review Overlay */}
      {isReviewing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
              <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
                  <h2 className="text-xl font-bold text-foreground">AI is reviewing your code...</h2>
                  <p className="text-muted-foreground mt-2">Analyzing time complexity and generating optimal approach.</p>
              </div>
          </div>
      )}

      {reviewData && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
              <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-border flex justify-between items-center bg-card">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                              <Sparkles className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                              <h2 className="text-lg font-bold text-foreground leading-tight">Optimal Approach & Review</h2>
                              <p className="text-xs text-muted-foreground font-medium">Expert feedback on your solution</p>
                          </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setReviewData(null)} className="text-muted-foreground hover:text-foreground hover:bg-zinc-800 rounded-xl">
                          <X className="w-5 h-5" />
                      </Button>
                  </div>
                  <div className="p-8 overflow-y-auto custom-scrollbar bg-muted prose prose-invert max-w-none text-muted-foreground">
                      <ReactMarkdown>{reviewData}</ReactMarkdown>
                  </div>
                  <div className="p-4 border-t border-border bg-card flex justify-end">
                      <Button onClick={() => setReviewData(null)} className="bg-purple-600 hover:bg-purple-700 text-foreground font-bold rounded-xl px-8">
                          Awesome, got it!
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* Floating Webcam Proctoring UI */}
      <motion.div 
        drag 
        dragMomentum={false}
        className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg border-2 border-border/50 shadow-2xl overflow-hidden z-50 flex items-center justify-center cursor-move"
      >
        {cameraError ? (
          <div className="flex flex-col items-center text-muted-foreground p-4 text-center pointer-events-none">
            <CameraOff className="w-8 h-8 mb-2" />
            <span className="text-xs font-bold uppercase tracking-wider">Camera Blocked</span>
            <span className="text-[10px]">Please enable for proctoring</span>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform -scale-x-100 pointer-events-none"
          />
        )}
        {!cameraError && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-red-500 uppercase tracking-widest border border-border pointer-events-none">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live
          </div>
        )}
      </motion.div>
    </div>
  );
}
