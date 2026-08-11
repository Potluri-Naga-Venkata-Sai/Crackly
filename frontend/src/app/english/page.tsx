"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, BookOpen, Quote, PenTool, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgram } from "@/context/ProgramContext";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { validateResponse } from "@/lib/schemas";

export default function EnglishTestsPage() {
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState<"Grammar" | "Vocabulary" | "Reading Comprehension" | "Stream">("Grammar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { program } = useProgram();

  const handleGenerate = async (onSuccess: (data: any[]) => void, onError: (err: string) => void) => {
    if (!company.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/english/generate`, {
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

      localStorage.setItem("english_generations", (parseInt(localStorage.getItem("english_generations") || "0") + 1).toString());
      sessionStorage.setItem("english_track_company", company);
      sessionStorage.setItem("english_track_topic", topic);
      
      onSuccess(validatedData);
    } catch (err: any) {
      setError(err.message || "Failed to generate problems. Please try again.");
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      moduleKey="english"
      title="English Tests"
      description="Curated grammar and verbal tracks for your target company"
      icon={<BookOpen className="h-7 w-7 text-indigo-500" strokeWidth={2} />}
      iconColorClass="text-indigo-500"
      iconBgClass="bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
      emptyStateIcon={<Quote className="h-8 w-8 text-indigo-500" strokeWidth={1.5} />}
      emptyStateTitle="No English tests assigned"
      emptyStateDescription="When you generate a custom interview track, they will show up here with search, filters, and progress tracking."
      getQuestionRoute={() => "/english/practice"}
      renderQuestionMetadata={(q) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          {q.topic === "Grammar" && <BookOpen className="w-3.5 h-3.5" />}
          {q.topic === "Vocabulary" && <Quote className="w-3.5 h-3.5" />}
          {q.topic === "Reading Comprehension" && <PenTool className="w-3.5 h-3.5" />}
          {q.topic}
        </span>
      )}
      renderGenerateForm={(onSuccess, onError) => (
        <div className="flex flex-col gap-3">
          <Input 
            placeholder="Enter Target Company (e.g. Meta)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="bg-card border-border h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-indigo-600 rounded-xl font-medium"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate(onSuccess, onError)}
          />
          <div className="flex gap-2 p-1 bg-card border border-border/50 rounded-lg">
            <button
              onClick={() => setTopic("Grammar")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all",
                topic === "Grammar" ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Grammar
            </button>
            <button
              onClick={() => setTopic("Vocabulary")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all",
                topic === "Vocabulary" ? "bg-purple-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Quote className="w-4 h-4" />
              Vocab
            </button>
            <button
              onClick={() => setTopic("Reading Comprehension")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all",
                topic === "Reading Comprehension" ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <PenTool className="w-4 h-4" />
              RC
            </button>
            <button
              onClick={() => setTopic("Stream")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all",
                topic === "Stream" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutTemplate className="w-4 h-4" />
              Stream
            </button>
          </div>
          {error && <p className="text-red-500 text-xs text-left">{error}</p>}
          <Button 
            onClick={() => handleGenerate(onSuccess, onError)}
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
      )}
    />
  );
}
