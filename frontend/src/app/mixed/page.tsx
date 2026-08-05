"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Loader2, Layers, Building, Play, Clock, Code2, ListChecks, History, Menu, CheckCircle2, ChevronDown, AlignJustify, UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useProgram } from "@/context/ProgramContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MixedPage() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState<"General" | "Stream">("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "score_high" | "score_low">("newest");
  const [mode, setMode] = useState<"standard" | "resume">("standard");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { program } = useProgram();

  useEffect(() => {
    const hist = JSON.parse(localStorage.getItem("mixed_submissions") || "[]");
    setHistory(hist);
    
    const track = sessionStorage.getItem("mixed_assessment");
    if (track) {
      try {
        setAssessment(JSON.parse(track));
        setCompany(sessionStorage.getItem("mixed_assessment_company") || "");
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
      
      const res = await fetch("http://localhost:8000/api/mixed/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to generate assessment");
      }

      const data = await res.json();
      setAssessment(data);
      sessionStorage.setItem("mixed_assessment", JSON.stringify(data));
      localStorage.setItem("mixed_generations", (parseInt(localStorage.getItem("mixed_generations") || "0") + 1).toString());
      sessionStorage.setItem("mixed_assessment_company", company);
    } catch (err: any) {
      setError(err.message || "Failed to generate assessment.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResume = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("program", program);

    try {
      const res = await fetch("http://localhost:8000/api/mixed/generate-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to parse resume.");
      }

      const data = await res.json();
      setAssessment(data);
      sessionStorage.setItem("mixed_assessment", JSON.stringify(data));
      localStorage.setItem("mixed_generations", (parseInt(localStorage.getItem("mixed_generations") || "0") + 1).toString());
      sessionStorage.setItem("mixed_assessment_company", "Resume-Based");
    } catch (err: any) {
      setError(err.message || "Failed to process resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = () => {
    router.push("/mixed/assessment");
  };

  let filteredHistory = history.filter(s => s.company.toLowerCase().includes(searchQuery.toLowerCase()));
  if (sortOrder === "score_high") {
    filteredHistory.sort((a, b) => (b.score || 0) - (a.score || 0));
  } else if (sortOrder === "score_low") {
    filteredHistory.sort((a, b) => (a.score || 0) - (b.score || 0));
  } else {
    filteredHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  const pendingCount = assessment ? 1 : 0;
  const completedCount = history.length;
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
          <div className="bg-muted border border-[var(--chart-1)]/20 p-3 rounded-xl flex items-center justify-center shadow-inner">
            <Layers className="h-7 w-7 text-[var(--chart-1)]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-tight mb-1">Mixed Online Assessment</h1>
            <p className="text-sm text-muted-foreground font-medium">Full 60-minute OA simulator combining Coding & Aptitude</p>
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
            placeholder="Search mixed assessments..."
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
            {assessment ? 1 : 0}
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
            {history.length}
          </span>
        </button>
      </div>

      <div className="text-sm text-muted-foreground mb-4 pb-4 border-b border-border/30">
        Showing <span className="text-foreground font-bold">{activeTab === "all" ? (assessment ? 1 : 0) : filteredHistory.length}</span> of <span className="text-foreground font-bold">{activeTab === "all" ? (assessment ? 1 : 0) : history.length}</span> tests
      </div>

      <div className="flex-1 flex flex-col">
        {activeTab === "all" ? (
          !assessment ? (
            <div className="flex-1 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-muted/50">
              <div className="flex bg-card p-1 rounded-xl border border-border mb-8 w-full max-w-md shadow-sm">
                <button 
                  onClick={() => setMode("standard")}
                  className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", mode === "standard" ? "bg-white text-black shadow-md" : "text-muted-foreground hover:text-muted-foreground")}
                >
                  Standard Track
                </button>
                <button 
                  onClick={() => setMode("resume")}
                  className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", mode === "resume" ? "bg-white text-black shadow-md" : "text-muted-foreground hover:text-muted-foreground")}
                >
                  Resume-Based
                </button>
              </div>

              {mode === "standard" ? (
                <div className="bg-background border border-border/50 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
                  
                  <h3 className="text-left text-[15px] font-bold text-foreground mb-5">Generate Target Assessment</h3>

                  <div className="flex gap-2 p-1 bg-card border border-border/80 rounded-lg mb-5">
                    <button
                      onClick={() => setTopic("General")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all",
                        topic === "General" ? "bg-purple-600 text-white shadow-sm" : "text-muted-foreground hover:text-muted-foreground"
                      )}
                    >
                      General
                    </button>
                    <button
                      onClick={() => setTopic("Stream")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all",
                        topic === "Stream" ? "bg-purple-600 text-white shadow-sm" : "text-muted-foreground hover:text-muted-foreground"
                      )}
                    >
                      Stream
                    </button>
                  </div>

                  <div className="space-y-4">
                    <Input 
                      placeholder="Enter Target Company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="bg-card border-border h-11 text-sm text-muted-foreground placeholder:text-muted-foreground focus-visible:ring-purple-500/50 rounded-lg"
                      onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    />
                    {error && <p className="text-red-500 text-xs text-left">{error}</p>}
                    <Button 
                      onClick={handleGenerate}
                      disabled={loading || !company.trim()}
                      className="w-full bg-zinc-300 hover:bg-white text-black h-11 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Assessment...
                        </>
                      ) : (
                        "Generate Track"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md bg-background border border-border p-6 rounded-2xl shadow-lg animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="text-foreground font-bold mb-4 text-left">Upload Resume</h3>
                  <p className="text-xs text-muted-foreground text-left mb-4">Extract your tech stack to generate a highly personalized Mixed OA.</p>
                  
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 mb-4 transition-all cursor-pointer flex flex-col items-center justify-center",
                      file ? "border-purple-500 bg-purple-500/5" : "border-border hover:border-zinc-500 bg-card"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      accept=".pdf" 
                      ref={fileInputRef} 
                      onChange={(e) => e.target.files && setFile(e.target.files[0])} 
                      className="hidden"
                    />
                    {file ? (
                      <>
                        <FileText className="w-8 h-8 text-purple-400 mb-2" />
                        <span className="text-foreground font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 text-center">Click to change</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-muted-foreground font-medium text-sm">Click to upload (PDF)</span>
                      </>
                    )}
                  </div>

                  {error && <p className="text-red-500 text-xs mb-3 text-left">{error}</p>}
                  <Button 
                    onClick={handleGenerateResume}
                    disabled={loading || !file}
                    className="w-full bg-foreground hover:bg-foreground/90 text-background h-12 rounded-xl font-bold transition-all"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                      "Generate Resume Assessment"
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 bg-background border border-border/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2 capitalize">{company} Online Assessment</h2>
                <p className="text-muted-foreground">Your personalized assessment is ready. Ensure you have 60 minutes of uninterrupted time.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-12">
                <div className="bg-card border border-border/50 rounded-xl p-6 flex flex-col items-center gap-3">
                  <div className="bg-[var(--chart-1)]/10 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-[var(--chart-1)]" />
                  </div>
                  <h3 className="font-bold text-foreground">60 Minutes</h3>
                  <p className="text-xs text-muted-foreground">Strict Time Limit</p>
                </div>
                <div className="bg-card border border-border/50 rounded-xl p-6 flex flex-col items-center gap-3">
                  <div className="bg-red-500/10 p-3 rounded-full">
                    <Code2 className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-bold text-foreground">2 Coding Questions</h3>
                  <p className="text-xs text-muted-foreground">Medium & Hard Difficulty</p>
                </div>
                <div className="bg-card border border-border/50 rounded-xl p-6 flex flex-col items-center gap-3">
                  <div className="bg-orange-500/10 p-3 rounded-full">
                    <ListChecks className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-foreground">6 Aptitude MCQs</h3>
                  <p className="text-xs text-muted-foreground">Quant, Logical, Verbal</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAssessment(null);
                    sessionStorage.removeItem("mixed_assessment");
                  }} 
                  className="bg-card border-border/50 text-muted-foreground h-14 px-8 rounded-xl font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleStartAssessment}
                  className="bg-[var(--chart-1)] hover:bg-[var(--chart-1)]/80 text-foreground h-14 px-12 rounded-xl font-bold text-lg"
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Start Assessment Now
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {filteredHistory.length > 0 ? (
              <div className="bg-background border border-border/50 rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredHistory.map((item, idx) => (
                    <div key={idx} className="bg-card border border-border/50 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-foreground text-lg capitalize">{item.company} OA</h3>
                          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-emerald-400">{item.score}</span>
                          <span className="text-sm text-muted-foreground"> / {item.maxScore}</span>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Aptitude Score</p>
                        </div>
                      </div>
                      <div className="border-t border-border/50 pt-3 mt-3">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">Coding Evaluation:</p>
                        {item.codingResults?.map((cr: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground truncate pr-2">Q. {cr.title}</span>
                            <span className={cn("font-bold shrink-0", cr.is_correct ? "text-emerald-500" : "text-red-500")}>
                              {cr.is_correct ? "Passed" : "Failed"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-muted/50 min-h-[400px]">
                <History className="h-8 w-8 text-muted-foreground mb-4" />
                <h2 className="text-[22px] font-bold text-foreground mb-2">No completed assessments</h2>
                <p className="text-sm text-muted-foreground max-w-[500px]">
                  You haven't completed any Mixed Online Assessments yet, or none match your search.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
