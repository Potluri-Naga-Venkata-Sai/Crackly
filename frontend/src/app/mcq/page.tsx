"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ListFilter, Code2, Database, Server, FileText, UploadCloud, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgram } from "@/context/ProgramContext";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { validateResponse } from "@/lib/schemas";

export default function MCQTestsPage() {
  const [mode, setMode] = useState<"standard" | "resume">("standard");
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState<"DSA" | "SQL" | "System Design" | "Stream">("DSA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { program } = useProgram();

  const handleGenerateStandard = async (onSuccess: (data: any[]) => void, onError: (err: string) => void) => {
    if (!company.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mcq/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: company, topic, program }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to generate questions");
      }

      const problemData = await res.json();
      const validatedData = validateResponse(problemData, false);

      localStorage.setItem("mcq_generations", (parseInt(localStorage.getItem("mcq_generations") || "0") + 1).toString());
      sessionStorage.setItem("mcq_track_company", company);
      sessionStorage.setItem("mcq_track_topic", topic);
      
      onSuccess(validatedData);
    } catch (err: any) {
      setError(err.message || "Failed to generate problems. Please try again.");
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResume = async (onSuccess: (data: any[]) => void, onError: (err: string) => void) => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("program", program);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mcq/generate-from-resume`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to parse resume.");
      }

      const problemData = await res.json();
      const validatedData = validateResponse(problemData, false);

      localStorage.setItem("mcq_generations", (parseInt(localStorage.getItem("mcq_generations") || "0") + 1).toString());
      sessionStorage.setItem("mcq_track_company", "Personalized");
      sessionStorage.setItem("mcq_track_topic", "Resume Extracted");
      
      onSuccess(validatedData);
    } catch (err: any) {
      setError(err.message || "Failed to process resume.");
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      moduleKey="mcq"
      title="MCQ Tests"
      description="Advanced multiple choice questions for core tech subjects"
      icon={<ListFilter className="h-7 w-7 text-purple-400" strokeWidth={2} />}
      iconColorClass="text-purple-400"
      iconBgClass="bg-purple-500/10 text-purple-400 border-purple-500/20"
      emptyStateIcon={<ListFilter className="h-8 w-8 text-purple-400" strokeWidth={1.5} />}
      emptyStateTitle="No MCQ tests assigned"
      emptyStateDescription="When you generate a custom interview track, they will show up here with search, filters, and progress tracking."
      getQuestionRoute={() => "/mcq/practice"}
      renderQuestionMetadata={(q) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          {q.topic === "DSA" && <Code2 className="w-3.5 h-3.5" />}
          {q.topic === "SQL" && <Database className="w-3.5 h-3.5" />}
          {q.topic === "System Design" && <Server className="w-3.5 h-3.5" />}
          {q.topic}
        </span>
      )}
      renderGenerateForm={(onSuccess, onError) => (
        <div className="flex flex-col gap-3">
          <div className="flex bg-card p-1 rounded-xl border border-border mb-4 w-full shadow-sm">
            <button 
              onClick={() => setMode("standard")}
              className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-all", mode === "standard" ? "bg-white text-black shadow" : "text-muted-foreground hover:text-foreground")}
            >
              Standard Track
            </button>
            <button 
              onClick={() => setMode("resume")}
              className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-all", mode === "resume" ? "bg-white text-black shadow" : "text-muted-foreground hover:text-foreground")}
            >
              Resume-Based
            </button>
          </div>

          {mode === "standard" ? (
            <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
              <Input 
                placeholder="Enter Target Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-card border-border h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-purple-600 rounded-xl font-medium"
                onKeyDown={(e) => e.key === "Enter" && handleGenerateStandard(onSuccess, onError)}
              />
              <div className="flex gap-2 p-1 bg-card border border-border/50 rounded-lg">
                {(["DSA", "SQL", "System Design", "Stream"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all",
                      topic === t ? "bg-purple-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t === "DSA" && <Code2 className="w-3.5 h-3.5" />}
                    {t === "SQL" && <Database className="w-3.5 h-3.5" />}
                    {t === "System Design" && <Server className="w-3.5 h-3.5" />}
                    {t === "Stream" && <LayoutTemplate className="w-3.5 h-3.5" />}
                    {t === "Stream" ? "Stream" : t}
                  </button>
                ))}
              </div>
              {error && <p className="text-red-500 text-xs text-left">{error}</p>}
              <Button 
                onClick={() => handleGenerateStandard(onSuccess, onError)}
                disabled={loading || !company.trim()}
                className="w-full bg-foreground hover:bg-foreground/90 text-background h-12 rounded-xl font-bold transition-all mt-2"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  "Generate Track"
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-xs text-muted-foreground text-left mb-1">Extract your tech stack to generate highly personalized MCQs.</p>
              <div 
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 mb-2 transition-all cursor-pointer flex flex-col items-center justify-center",
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
              {error && <p className="text-red-500 text-xs text-left">{error}</p>}
              <Button 
                onClick={() => handleGenerateResume(onSuccess, onError)}
                disabled={loading || !file}
                className="w-full bg-foreground hover:bg-foreground/90 text-background h-12 rounded-xl font-bold transition-all mt-2"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  "Generate Resume Track"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    />
  );
}
