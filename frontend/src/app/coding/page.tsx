"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Code2, Database, Braces, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgram } from "@/context/ProgramContext";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { validateResponse } from "@/lib/schemas";

export default function CodingTestsPage() {
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState<"DSA" | "SQL" | "Stream">("DSA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { program } = useProgram();

  const handleGenerate = async (onSuccess: (data: any[]) => void, onError: (err: string) => void) => {
    if (!company.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const payload: any = { company_name: company, topic };
      if (topic === "Stream") {
        payload.program = program;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dsa/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to generate questions");
      }

      const problemData = await res.json();
      const validatedData = validateResponse(problemData, false);

      localStorage.setItem("coding_generations", (parseInt(localStorage.getItem("coding_generations") || "0") + 1).toString());
      sessionStorage.setItem("coding_track_company", company);
      sessionStorage.setItem("coding_track_topic", topic);
      
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
      moduleKey="coding"
      title="Coding Tests"
      description="DSA practice and code-based tasks"
      icon={<Code2 className="h-7 w-7 text-blue-400" strokeWidth={2} />}
      iconColorClass="text-blue-400"
      iconBgClass="bg-blue-500/10 text-blue-400 border-blue-500/20"
      emptyStateIcon={<Code2 className="h-8 w-8 text-blue-400" strokeWidth={1.5} />}
      emptyStateTitle="No Coding tests assigned"
      emptyStateDescription="When you generate a custom interview track, they will show up here with search, filters, and progress tracking."
      getQuestionRoute={() => "/coding/practice"}
      renderQuestionMetadata={(q) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          {q.topic === "SQL" ? <Database className="w-3.5 h-3.5" /> : <Braces className="w-3.5 h-3.5" />}
          {q.topic}
        </span>
      )}
      renderGenerateForm={(onSuccess, onError) => (
        <div className="flex flex-col gap-3">
          <Input 
            placeholder="Enter Target Company (e.g. Meta)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="bg-card border-border h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-600 rounded-xl font-medium"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate(onSuccess, onError)}
          />
          <div className="flex gap-2 p-1 bg-card border border-border/50 rounded-lg">
            <button
              onClick={() => setTopic("DSA")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all",
                topic === "DSA" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Braces className="w-4 h-4" />
              DSA
            </button>
            <button
              onClick={() => setTopic("Stream")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all",
                topic === "Stream" ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
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
