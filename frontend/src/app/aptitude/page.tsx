"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LineChart, Brain, MessageCircle, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgram } from "@/context/ProgramContext";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { validateResponse } from "@/lib/schemas";

export default function AptitudeTestsPage() {
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState<"Quantitative" | "Logical" | "Verbal" | "Stream">("Quantitative");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { program } = useProgram();

  const handleGenerate = async (onSuccess: (data: any[]) => void, onError: (err: string) => void) => {
    if (!company.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/aptitude/generate`, {
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

      localStorage.setItem("aptitude_generations", (parseInt(localStorage.getItem("aptitude_generations") || "0") + 1).toString());
      sessionStorage.setItem("aptitude_track_company", company);
      sessionStorage.setItem("aptitude_track_topic", topic);
      
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
      moduleKey="aptitude"
      title="Aptitude Tests"
      description="Curated reasoning & aptitude tracks for your target company"
      icon={<LineChart className="h-7 w-7 text-orange-500" strokeWidth={2} />}
      iconColorClass="text-orange-500"
      iconBgClass="bg-orange-500/10 text-orange-500 border-orange-500/20"
      emptyStateIcon={<Brain className="h-8 w-8 text-orange-500" strokeWidth={1.5} />}
      emptyStateTitle="No Aptitude tests assigned"
      emptyStateDescription="When you generate a custom interview track, they will show up here with search, filters, and progress tracking."
      getQuestionRoute={() => "/aptitude/practice"}
      renderQuestionMetadata={(q) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          {q.topic === "Quantitative" && <LineChart className="w-3.5 h-3.5" />}
          {q.topic === "Logical" && <Brain className="w-3.5 h-3.5" />}
          {q.topic === "Verbal" && <MessageCircle className="w-3.5 h-3.5" />}
          {q.topic}
        </span>
      )}
      renderGenerateForm={(onSuccess, onError) => (
        <div className="flex flex-col gap-3">
          <Input 
            placeholder="Enter Target Company (e.g. Meta)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="bg-card border-border h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-orange-600 rounded-xl font-medium"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate(onSuccess, onError)}
          />
          <div className="flex gap-2 p-1 bg-card border border-border/50 rounded-lg">
            <button
              onClick={() => setTopic("Quantitative")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all",
                topic === "Quantitative" ? "bg-orange-600 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LineChart className="w-4 h-4" />
              Quant
            </button>
            <button
              onClick={() => setTopic("Logical")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all",
                topic === "Logical" ? "bg-purple-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Brain className="w-4 h-4" />
              Logic
            </button>
            <button
              onClick={() => setTopic("Verbal")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all",
                topic === "Verbal" ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              Verbal
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
