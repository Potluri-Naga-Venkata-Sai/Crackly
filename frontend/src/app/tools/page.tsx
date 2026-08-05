"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Loader2, ListChecks, MessageCircle, Play, Flame, Clock, ChevronRight, Menu, CheckCircle2, ChevronDown, AlignJustify , LayoutTemplate} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgram } from "@/context/ProgramContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ToolsTestsPage() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState<"General" | "Stream" | "Git" | "GitHub" | "Docker" | "Kubernetes">("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "completed">("all");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "score_high" | "score_low">("newest");
  
  const { program } = useProgram();

  useEffect(() => {
    const track = sessionStorage.getItem("tools_track");
    if (track) {
      try {
        setQuestions(JSON.parse(track));
        setCompany(sessionStorage.getItem("tools_track_company") || "");
        setTopic((sessionStorage.getItem("tools_track_topic") as any) || "General");
      } catch(e) {}
    }

    const savedSubmissions = localStorage.getItem("tools_submissions");
    if (savedSubmissions) {
      try {
        setSubmissions(JSON.parse(savedSubmissions));
      } catch(e) {}
    }
  }, []);

  const handleGenerate = async () => {
    if (!company.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const payload: any = { company_name: company };
      if (topic === "Stream") {
        payload.program = program;
      }
      
      const res = await fetch("http://localhost:8000/api/tools/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to generate questions");
      }

      const problemData = await res.json();
      setQuestions(problemData);
      
      sessionStorage.setItem("tools_track", JSON.stringify(problemData));
      sessionStorage.setItem("tools_track_id", Date.now().toString());
      localStorage.setItem("tools_generations", (parseInt(localStorage.getItem("tools_generations") || "0") + 1).toString());
      sessionStorage.setItem("tools_track_company", company);
      sessionStorage.setItem("tools_track_topic", topic);
    } catch (err: any) {
      setError(err.message || "Failed to generate aptitude problems. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = (problem: any) => {
    sessionStorage.setItem("current_subjective_problem", JSON.stringify(problem));
    router.push("/subjective/practice");
  };

  const filteredQuestions = questions.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()));
  let filteredSubmissions = submissions.filter(s => s.problemTitle.toLowerCase().includes(searchQuery.toLowerCase()));

  if (sortOrder === "score_high") {
    filteredSubmissions.sort((a, b) => (b.score || 0) - (a.score || 0));
  } else if (sortOrder === "score_low") {
    filteredSubmissions.sort((a, b) => (a.score || 0) - (b.score || 0));
  } else {
    filteredSubmissions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  const pendingCount = questions.length;
  const completedCount = submissions.length;
  const totalCount = pendingCount + completedCount;

  const getSortLabel = () => {
    if (sortOrder === "score_high") return "Score: High to Low";
    if (sortOrder === "score_low") return "Score: Low to High";
    return "Newest First";
  };

  return (
    <div className="flex-1 p-8 font-sans max-w-[1400px] mx-auto w-full h-full flex flex-col">
      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium w-fit mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-muted border border-pink-500/20 p-3 rounded-xl flex items-center justify-center shadow-inner">
            <ListChecks className="h-7 w-7 text-pink-500" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-tight mb-1">Developer Tools Tests</h1>
            <p className="text-sm text-muted-foreground font-medium">Git, Docker, Kubernetes, AWS</p>
          </div>
        </div>

        <div className="flex gap-3">
          
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
            placeholder="Search aptitude tests..."
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
          All
          <span className={cn(
            "px-1.5 py-0.5 rounded-full text-[11px] font-bold",
            activeTab === "all" ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
          )}>
            {questions.length}
          </span>
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
            {submissions.length}
          </span>
        </button>
      </div>

      <div className="text-sm text-muted-foreground mb-4 pb-4 border-b border-border/30">
        Showing <span className="text-foreground font-bold">{activeTab === "all" ? filteredQuestions.length : filteredSubmissions.length}</span> of <span className="text-foreground font-bold">{activeTab === "all" ? questions.length : submissions.length}</span> tests
      </div>

      <div className="flex-1 flex flex-col">
        {activeTab === "all" ? (
          questions.length === 0 ? (
            <div className="flex-1 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-muted/50">
              <div className="bg-card border border-border p-4 rounded-2xl mb-6 shadow-sm">
                <ListChecks className="h-8 w-8 text-pink-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-[22px] font-bold text-foreground mb-2">No Developer Tools tests assigned</h2>
              <p className="text-sm text-muted-foreground max-w-[500px] mb-10 leading-relaxed">
                When you generate a custom interview track, they will show up here with search, filters, and progress tracking.
              </p>

              <div className="w-full max-w-md bg-background border border-border p-6 rounded-2xl shadow-lg">
                <h3 className="text-foreground font-bold mb-4 text-left">Generate Custom Track</h3>
                
                <div className="flex flex-col gap-3">
                  <Input 
                    placeholder="Enter Target Company (e.g. Meta)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="bg-card border-border h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-pink-600 rounded-xl font-medium"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  />
                  <div className="flex flex-wrap gap-2 p-1 bg-card border border-border/50 rounded-lg">
                    {["General", "Stream", "Git", "GitHub", "Docker", "Kubernetes"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTopic(t as any)}
                        className={cn(
                          "flex-1 min-w-[80px] flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-md transition-all",
                          topic === t 
                            ? "bg-foreground text-background shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {t === "Stream" ? "Stream Specific" : t}
                      </button>
                    ))}
                  </div>
                  {error && <p className="text-red-500 text-xs text-left">{error}</p>}
                  <Button 
                    onClick={handleGenerate}
                    disabled={loading || !company.trim()}
                    className="w-full bg-foreground hover:bg-foreground/90 text-background h-12 rounded-xl font-bold transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Track"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredQuestions.map((q, idx) => (
                <div 
                  key={idx} 
                  className="bg-background border border-border/80 rounded-2xl p-5 hover:bg-card transition-colors group flex items-center justify-between cursor-pointer"
                  onClick={() => handleStartPractice(q)}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-mono text-sm">#{idx + 1}</span>
                      <h3 className="text-[17px] font-bold text-foreground group-hover:text-orange-400 transition-colors">{q.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border",
                        q.difficulty === "Easy" ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20" :
                        q.difficulty === "Medium" ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" :
                        "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                      )}>
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {q.topic === "Quantitative" && <ListChecks className="w-3.5 h-3.5" />}
                        {q.topic === "Logical" && <ListChecks className="w-3.5 h-3.5" />}
                        {q.topic === "Verbal" && <MessageCircle className="w-3.5 h-3.5" />}
                        {q.topic}
                      </span>
                      {q.times_asked && (
                        <span className="text-xs text-orange-400/90 font-semibold flex items-center gap-1.5 ml-2">
                          <Flame className="w-3.5 h-3.5" />
                          Asked {q.times_asked}x
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5">
                    <div className="hidden sm:block text-right">
                      <div className="text-sm font-semibold text-muted-foreground">{q.company}</div>
                      <div className="text-[11px] text-muted-foreground font-medium">Target Company</div>
                    </div>
                    <Button size="icon" className="bg-pink-600 hover:bg-orange-700 text-foreground rounded-full h-11 w-11 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Play className="h-5 w-5 ml-0.5" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {questions.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <Button variant="ghost" onClick={() => {
                    setQuestions([]);
                    sessionStorage.removeItem("tools_track");
                  }} className="text-muted-foreground hover:text-foreground">
                    Clear Track & Generate New
                  </Button>
                </div>
              )}
            </div>
          )
        ) : (
          filteredSubmissions.length === 0 ? (
            <div className="flex-1 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-muted/50">
              <div className="bg-card border border-border p-4 rounded-2xl mb-6 shadow-sm">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h2 className="text-[22px] font-bold text-foreground mb-2">No Completed Tests</h2>
              <p className="text-sm text-muted-foreground max-w-[500px] leading-relaxed">
                You haven't submitted any aptitude solutions yet. Go to the All tab, pick a problem, and submit your answer to track your history here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubmissions.map((sub, idx) => (
                <div 
                  key={sub.id || idx} 
                  className="bg-background border border-border/80 rounded-2xl p-5 hover:bg-card transition-colors flex flex-col relative group cursor-pointer"
                  onClick={() => {
                    if (sub.problemData) sessionStorage.setItem("current_tools_problem", JSON.stringify(sub.problemData));
                    router.push("/tools/practice");
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 border border-cyan-500/20">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-[15px] leading-tight mb-0.5 group-hover:text-cyan-500 transition-colors truncate max-w-[150px]">{sub.problemTitle || sub.title || "Tools Test"}</h3>
                        <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5"><Clock className="w-3 h-3" />{new Date(sub.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-500/20">Completed</div>
                  </div>
                  
                  {sub.score !== undefined && (
                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Score</span>
                      <span className="text-sm font-bold text-foreground">{sub.score}%</span>
                    </div>
                  )}
                  
                  {!sub.score && sub.language && (
                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Language</span>
                      <span className="text-xs font-bold text-foreground uppercase px-2 py-1 bg-muted rounded-md border border-border/50">{sub.language}</span>
                    </div>
                  )}
                  
                  {!sub.score && !sub.language && (
                     <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
                      <span className="text-sm font-bold text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Done</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
