"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ListChecks, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgram } from "@/context/ProgramContext";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { validateResponse } from "@/lib/schemas";

export default function ToolsTestsPage() {
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState<"General" | "Stream" | "Git" | "GitHub" | "Docker" | "Kubernetes">("General");
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
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tools/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to generate questions");
      }

      const problemData = await res.json();
      const validatedData = validateResponse(problemData, true);

      localStorage.setItem("tools_generations", (parseInt(localStorage.getItem("tools_generations") || "0") + 1).toString());
      sessionStorage.setItem("tools_track_company", company);
      sessionStorage.setItem("tools_track_topic", topic);
      
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
      moduleKey="tools"
      title="Developer Tools Tests"
      description="Git, Docker, Kubernetes, AWS"
      icon={<ListChecks className="h-7 w-7 text-pink-500" strokeWidth={2} />}
      iconColorClass="text-pink-500"
      iconBgClass="bg-pink-500/10 text-pink-500 border-pink-500/20"
      emptyStateIcon={<ListChecks className="h-8 w-8 text-pink-500" strokeWidth={1.5} />}
      emptyStateTitle="No Developer Tools tests assigned"
      emptyStateDescription="When you generate a custom interview track, they will show up here with search, filters, and progress tracking."
      getQuestionRoute={() => "/tools/practice"}
      renderQuestionMetadata={(q) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          {q.topic === "Quantitative" && <ListChecks className="w-3.5 h-3.5" />}
          {q.topic === "Logical" && <ListChecks className="w-3.5 h-3.5" />}
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
            className="bg-card border-border h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-pink-600 rounded-xl font-medium"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate(onSuccess, onError)}
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
