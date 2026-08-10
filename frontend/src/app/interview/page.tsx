"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader2, Sparkles, AlertTriangle, Mic, Upload, MicOff, Search, Clock, Activity, Target, Menu, CheckCircle2, ChevronDown, AlignJustify, Volume2, VolumeX } from "lucide-react";
import Webcam from "react-webcam";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { logActivity } from "@/lib/activity-tracker";
import { useProgram } from "@/context/ProgramContext";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"dashboard" | "interview">("dashboard");
  const [activeTab, setActiveTab] = useState<"all" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "score_high" | "score_low">("newest");
  
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  
  const [isTerminated, setIsTerminated] = useState(false);
  const [violations, setViolations] = useState(0);
  
  const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [thinkingCountdown, setThinkingCountdown] = useState(0);
  const [answeringCountdown, setAnsweringCountdown] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const [interviews, setInterviews] = useState<any[]>([]);

  const { program } = useProgram();
  
  const recognitionRef = useRef<any>(null);
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const answeringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef("");
  const isMicIntentionallyOn = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("interview_history");
    if (saved) setInterviews(JSON.parse(saved));
  }, [view]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setInput(finalTranscriptRef.current + interimTranscript);
        };
        
        recognition.onend = () => {
          if (isMicIntentionallyOn.current) {
            try { recognition.start(); } catch(e) {}
          } else {
            setIsListening(false);
          }
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Proctoring
  useEffect(() => {
    if (view !== "interview" || isTerminated || isGeneratingFeedback) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations((prev) => {
          const newViolations = prev + 1;
          if (newViolations >= 3) setIsTerminated(true);
          return newViolations;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [view, isTerminated, isGeneratingFeedback]);

  // Handle auto-submit when answering timer hits 0
  useEffect(() => {
    if (answeringCountdown === 0 && view === "interview" && !isSpeaking && thinkingCountdown === 0 && !loading && messages.length > 0) {
      if (messages[messages.length - 1].role === "assistant") {
        handleSend(input || "No answer provided within time limit.");
      }
    }
  }, [answeringCountdown]);

  useEffect(() => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      const loadVoices = () => {
        setAvailableVoices(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speakText = (text: string) => {
    if (!isVoiceEnabled) {
      // Simulate speaking time if voice is disabled
      setIsSpeaking(true);
      setTimeout(() => {
        setIsSpeaking(false);
        triggerAnsweringPhase();
      }, 2000);
      return;
    }

    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const preferredVoice = availableVoices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha") || v.lang === "en-US");
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 0.95; // Slightly slower for better articulation
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        triggerAnsweringPhase();
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const triggerAnsweringPhase = () => {
    setThinkingCountdown(5);
    if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
    
    thinkingIntervalRef.current = setInterval(() => {
      setThinkingCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(thinkingIntervalRef.current!);
          setAnsweringCountdown(120);
          if (answeringIntervalRef.current) clearInterval(answeringIntervalRef.current);
          answeringIntervalRef.current = setInterval(() => {
            setAnsweringCountdown((aprev) => {
              if (aprev <= 1) {
                clearInterval(answeringIntervalRef.current!);
                return 0;
              }
              return aprev - 1;
            });
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStart = async (overrideCompany?: string, overrideRole?: string) => {
    const targetCompany = overrideCompany || company;
    const targetRole = overrideRole || role;
    if (!targetCompany.trim() || !targetRole.trim()) return;
    
    setCompany(targetCompany);
    setRole(targetRole);
    setSetupLoading(true);
    
    let extractedText = "";
    if (resumeFile) {
      const formData = new FormData();
      formData.append("file", resumeFile);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/extract-text`, {
          method: "POST", body: formData
        });
        if (res.ok) {
          const data = await res.json();
          extractedText = data.text;
          setResumeText(extractedText);
        }
      } catch(e) {}
    }
    
    setView("interview");
    setLoading(true);
    setMessages([]);
    setViolations(0);
    setIsTerminated(false);
    setIsGeneratingFeedback(false);
    
    try {
      const payload = { company: targetCompany, role: targetRole, resume_text: extractedText, program, messages: [{ role: "user", content: "Hello! I am ready to begin the interview." }] };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.response }]);
      speakText(data.response);
    } catch (e) {
      const fallback = "Hi there. I seem to be having connection issues, but let's begin. Could you tell me about yourself?";
      setMessages([{ role: "assistant", content: fallback }]);
      speakText(fallback);
    } finally {
      setSetupLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const isStart = searchParams?.get("start");
    const qCompany = searchParams?.get("company");
    const qRole = searchParams?.get("role");
    
    if (isStart === "true" && qCompany && qRole) {
      // Auto-start the interview directly
      handleStart(qCompany, qRole);
    }
  }, [searchParams]);


  const finishInterview = async (finalMessages: any[]) => {
    setIsGeneratingFeedback(true);
    if (answeringIntervalRef.current) clearInterval(answeringIntervalRef.current);
    if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
    window.speechSynthesis.cancel();
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, program, messages: finalMessages })
      });
      const feedback = await res.json();
      
      const interviewId = Date.now().toString();
      const newRecord = {
        id: interviewId,
        date: new Date().toISOString(),
        company,
        role,
        duration: "10 min",
        level: "beginner",
        feedback
      };
      
      const updatedHistory = [newRecord, ...interviews];
      localStorage.setItem("interview_history", JSON.stringify(updatedHistory));
      setInterviews(updatedHistory);
      
      logActivity({
        module: "Mock Interview",
        title: `Mock Interview at ${company}`,
        score: feedback.overall_score?.toString(),
        description: `Role: ${role}. Completed successfully with ${violations} violations.`
      });

      router.push(`/interview/feedback/${interviewId}`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate feedback report. Check backend logs.");
      setIsGeneratingFeedback(false);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = typeof overrideInput === "string" ? overrideInput : input;
    if (!textToSend.trim() || thinkingCountdown > 0 || isSpeaking) return;
    
    if (isListening) {
      isMicIntentionallyOn.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    
    if (answeringIntervalRef.current) clearInterval(answeringIntervalRef.current);
    setAnsweringCountdown(0);
    
    const newMessages = [...messages, { role: "user" as const, content: textToSend }];
    setMessages(newMessages);
    setInput("");
    finalTranscriptRef.current = "";
    
    // Check if we hit 5 questions! (Assistant messages = questions)
    const assistantCount = newMessages.filter(m => m.role === "assistant").length;
    if (assistantCount >= 5) {
      await finishInterview(newMessages);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, program, resume_text: resumeText, messages: newMessages }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.response }]);
      speakText(data.response);
    } catch (e) {
      const fallback = "I'm having trouble processing that right now. Could we move on to the next topic?";
      setMessages([...newMessages, { role: "assistant", content: fallback }]);
      speakText(fallback);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      isMicIntentionallyOn.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      isMicIntentionallyOn.current = true;
      finalTranscriptRef.current = input; 
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const filteredInterviews = interviews.filter(inv => inv.role.toLowerCase().includes(searchQuery.toLowerCase()) || inv.company.toLowerCase().includes(searchQuery.toLowerCase()));

  if (sortOrder === "score_high") {
    filteredInterviews.sort((a, b) => (b.feedback.overallScore || 0) - (a.feedback.overallScore || 0));
  } else if (sortOrder === "score_low") {
    filteredInterviews.sort((a, b) => (a.feedback.overallScore || 0) - (b.feedback.overallScore || 0));
  } else {
    filteredInterviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const completedCount = interviews.length;
  const totalCount = completedCount; // Interviews don't have a 'pending' state

  const getSortLabel = () => {
    if (sortOrder === "score_high") return "Score: High to Low";
    if (sortOrder === "score_low") return "Score: Low to High";
    return "Newest First";
  };

  // VIEWS
  if (view === "dashboard") {
    return (
      <div className="flex-1 p-8 font-sans max-w-[1400px] mx-auto w-full h-full flex flex-col">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium w-fit mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-muted border border-purple-500/20 p-3 rounded-xl flex items-center justify-center shadow-inner">
              <Mic className="h-7 w-7 text-purple-400" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-tight mb-1">Mock Interviews</h1>
              <p className="text-sm text-muted-foreground font-medium">Voice-based technical and behavioral assessments</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-card border border-border/60 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
              <Menu className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-bold text-sm">{totalCount}</span>
              <span className="text-muted-foreground text-sm">total</span>
            </div>
            <div className="bg-card border border-[#059669]/30 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              <span className="text-foreground font-bold text-sm">{completedCount}</span>
              <span className="text-[#10B981] text-sm font-medium">completed</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search interviews by role or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="bg-background border border-border/50 rounded-xl px-4 py-3 flex items-center gap-2 hover:bg-card transition-colors text-sm outline-none">
              <AlignJustify className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{getSortLabel()}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
              <DropdownMenuItem onClick={() => setSortOrder("newest")} className="cursor-pointer text-muted-foreground focus:bg-muted focus:text-foreground">
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("score_high")} className="cursor-pointer text-muted-foreground focus:bg-muted focus:text-foreground">
                Score: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("score_low")} className="cursor-pointer text-muted-foreground focus:bg-muted focus:text-foreground">
                Score: Low to High
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
              activeTab === "all" 
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-900/20" 
                : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            Start New
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
              activeTab === "completed" 
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-900/20" 
                : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            Completed
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-[11px] font-bold",
              activeTab === "completed" ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
            )}>
              {interviews.length}
            </span>
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          {activeTab === "all" ? (
            <div className="flex-1 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-muted/50">
              <div className="bg-card border border-border p-4 rounded-2xl mb-6 shadow-sm">
                <Mic className="h-8 w-8 text-purple-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-[22px] font-bold text-foreground mb-2">Ready for a Mock Interview?</h2>
              <p className="text-sm text-muted-foreground max-w-[500px] mb-10 leading-relaxed">
                Start a strict, person-to-person mock interview with AI proctoring. Ensure your camera and microphone are working.
              </p>

              <div className="w-full max-w-md bg-background border border-border p-6 rounded-2xl shadow-lg animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-foreground font-bold mb-4 text-left">Interview Setup</h3>
                <div className="space-y-4">
                  <div>
                    <Input placeholder="Target Company (e.g. Google, Stripe)" value={company} onChange={(e) => setCompany(e.target.value)} className="bg-card border-border h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-purple-600 rounded-xl font-medium" />
                  </div>
                  <div>
                    <Input placeholder="Target Role (e.g. Software Engineer)" value={role} onChange={(e) => setRole(e.target.value)} className="bg-card border-border h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-purple-600 rounded-xl font-medium" />
                  </div>
                  <div>
                    <div className="relative">
                      <Input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="bg-card border-border h-12 pt-3 pl-10 cursor-pointer text-muted-foreground file:text-muted-foreground rounded-xl" />
                      <Upload className="w-4 h-4 text-muted-foreground absolute left-4 top-4" />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-left mt-1.5 ml-1">Optional: Upload resume to personalize questions.</p>
                  </div>
                  <Button onClick={() => handleStart()} disabled={!company.trim() || !role.trim() || setupLoading} className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background rounded-xl font-bold mt-2">
                    {setupLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Start Interview"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            filteredInterviews.length === 0 ? (
              <div className="flex-1 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-muted/50">
                <div className="bg-card border border-border p-4 rounded-2xl mb-6 shadow-sm">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <h2 className="text-[22px] font-bold text-foreground mb-2">No Completed Interviews</h2>
                <p className="text-sm text-muted-foreground max-w-[500px] leading-relaxed">
                  You haven't completed any mock interviews yet. Go to the Start New tab and begin your first proctored session!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInterviews.map((inv) => (
                  <div key={inv.id} className="bg-background border border-border/80 rounded-2xl p-5 hover:bg-card transition-colors flex flex-col relative group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                          <Mic className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-[15px] leading-tight mb-0.5 group-hover:text-purple-400 transition-colors truncate max-w-[180px]">{inv.role}</h3>
                          <p className="text-xs text-muted-foreground font-medium truncate max-w-[180px]">{inv.company}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                      <span className="px-2.5 py-1 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 text-[10px] font-bold uppercase tracking-wider">Completed</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"><Clock className="w-3.5 h-3.5" /> {inv.duration}</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"><Activity className="w-3.5 h-3.5" /> {inv.level}</span>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-border/30 flex justify-between items-center text-sm text-muted-foreground">
                      <span className="text-xs">{new Date(inv.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground bg-card px-2 py-0.5 rounded border border-border/50">{inv.feedback.overallScore}/50</span>
                      </div>
                    </div>
                    
                    <Link href={`/interview/feedback/${inv.id}`} className="absolute inset-0 z-10">
                      <span className="sr-only">View Feedback</span>
                    </Link>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  if (isTerminated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-[calc(100vh-4rem)] bg-muted">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Interview Terminated</h1>
        <p className="text-muted-foreground mb-8 max-w-md">We detected multiple violations (tab switching). To maintain integrity, the interview has been forcefully ended.</p>
        <Button onClick={() => { setIsTerminated(false); setView("dashboard"); }} className="bg-red-600 hover:bg-red-700 text-foreground font-bold h-12 px-8">Return to Dashboard</Button>
      </div>
    );
  }

  if (isGeneratingFeedback) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-[calc(100vh-4rem)] bg-muted">
        <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Evaluating Interview...</h1>
        <p className="text-muted-foreground max-w-sm">Please wait while the AI analyzes your technical depth, correctness, and communication skills to generate your comprehensive feedback report.</p>
      </div>
    );
  }

  const latestAssistantMessage = [...messages].reverse().find(m => m.role === "assistant")?.content || "Waiting...";
  const isInputDisabled = loading || isSpeaking || thinkingCountdown > 0 || answeringCountdown === 0;
  const currentQuestionNum = messages.filter(m => m.role === "assistant").length;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-muted relative">
      <div className="absolute top-6 right-6 w-48 aspect-video bg-background rounded-xl overflow-hidden border-2 border-border shadow-xl z-50">
        <Webcam audio={false} mirrored className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 flex gap-1"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /></div>
      </div>

      <div className="flex-none p-4 border-b border-border/50 bg-background flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { window.speechSynthesis.cancel(); setView("dashboard"); }} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-bold text-foreground leading-tight">Proctored Interview (Q{currentQuestionNum}/5)</h2>
            <p className="text-xs text-purple-400 font-medium">{role} at {company}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mr-52">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setIsVoiceEnabled(!isVoiceEnabled);
              if (isVoiceEnabled) window.speechSynthesis.cancel();
            }} 
            className="flex items-center gap-2 font-bold"
          >
            {isVoiceEnabled ? (
              <><Volume2 className="w-4 h-4 text-emerald-500" /> AI Voice: ON</>
            ) : (
              <><VolumeX className="w-4 h-4 text-muted-foreground" /> AI Voice: OFF</>
            )}
          </Button>
          {violations > 0 && (
            <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">
              Violations: {violations}/3
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="relative mb-12 flex items-center justify-center">
          {isSpeaking && (
            <>
              <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-[-20px] bg-purple-500/10 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
              <div className="absolute inset-[-40px] bg-purple-500/5 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
            </>
          )}
          <div className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center border-4 z-10 transition-colors duration-500 shadow-[0_0_50px_rgba(168,85,247,0.2)]",
            isSpeaking ? "bg-purple-600 border-purple-400 shadow-purple-500/50" : "bg-card border-purple-900",
            loading ? "animate-pulse border-purple-500/50" : ""
          )}>
            <div className="flex gap-1.5 items-center justify-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className={cn("w-2 rounded-full bg-white transition-all duration-150", isSpeaking ? "h-8 animate-[bounce_1s_infinite]" : "h-2")} style={{ animationDelay: isSpeaking ? `${i * 0.1}s` : '0s' }} />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-3xl text-center min-h-[100px]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p>Analyzing your response...</p>
            </div>
          ) : (
            <p className={cn("text-2xl font-medium transition-all duration-300", isSpeaking ? "text-foreground" : "text-muted-foreground")}>
              "{latestAssistantMessage}"
            </p>
          )}
        </div>
      </div>

      <div className="flex-none p-6 bg-background border-t border-border/50 relative z-40">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm px-2">
            <div className="text-muted-foreground font-medium">
              {isSpeaking ? "Interviewer is speaking..." : 
               thinkingCountdown > 0 ? "Take a moment to think..." : 
               answeringCountdown > 0 ? "Your turn to speak or type." : "Waiting..."}
            </div>
            
            {thinkingCountdown > 0 && (
              <div className="text-blue-400 font-bold flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                Think: {thinkingCountdown}s
              </div>
            )}
            
            {answeringCountdown > 0 && (
              <div className={cn("font-bold flex items-center gap-2 px-3 py-1 rounded-full border", 
                answeringCountdown < 15 ? "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20")}>
                Answer Time: {answeringCountdown}s
              </div>
            )}
          </div>
          
          {answeringCountdown > 0 && (
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mb-1">
              <div className={cn("h-full transition-all duration-1000", answeringCountdown < 15 ? "bg-red-500" : "bg-emerald-500")} style={{ width: `${(answeringCountdown / 120) * 100}%` }} />
            </div>
          )}

          <div className="flex gap-2 relative">
            <Button 
              onClick={toggleMic} disabled={isInputDisabled}
              className={cn("w-14 h-14 shrink-0 rounded-2xl transition-all", isListening ? "bg-red-500 hover:bg-red-600 animate-pulse text-foreground shadow-[0_0_20px_rgba(239,68,68,0.5)]" : "bg-card hover:bg-zinc-800 text-muted-foreground border border-border/50")}
            >
              {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </Button>
            
            <Input 
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isListening ? "Listening... Speak your answer now." : isInputDisabled ? "Please wait..." : "Type your response here or use the microphone..."}
              disabled={isInputDisabled} className="flex-1 bg-card border-border/50 focus-visible:ring-purple-500 h-14 text-lg rounded-2xl px-6"
            />
            
            <Button onClick={() => handleSend()} disabled={!input.trim() || isInputDisabled} className="bg-purple-600 hover:bg-purple-700 text-foreground w-24 h-14 rounded-2xl shrink-0 font-bold text-lg">
              {currentQuestionNum >= 5 ? "Finish" : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading interview...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
