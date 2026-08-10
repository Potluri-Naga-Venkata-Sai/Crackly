"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Briefcase, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgram } from "@/context/ProgramContext";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { validateResponse } from "@/lib/schemas";

export default function CompanyTestsPage() {
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState<"General" | "Stream">("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { program } = useProgram();

  const handleGenerate = async (onSuccess: (data: any[]) => void, onError: (err: string) => void) => {
    if (!company.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const payload: any = { company_name: company };
      if (topic === "Stream") {
        payload.program = program;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/company/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to generate questions");
      }

      const problemData = await res.json();
      
      // Zod Validation
      const validatedData = validateResponse(problemData, true);

      localStorage.setItem("company_generations", (parseInt(localStorage.getItem("company_generations") || "0") + 1).toString());
      sessionStorage.setItem("company_track_company", company);
      sessionStorage.setItem("company_track_topic", topic);
      
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
      moduleKey="company"
      title="Company Fit Tests"
      description="Behavioral and leadership principles"
      icon={<Briefcase className="h-7 w-7 text-orange-500" strokeWidth={2} />}
      iconColorClass="text-orange-500"
      iconBgClass="bg-orange-500/10 text-orange-500 border-orange-500/20"
      emptyStateIcon={<Briefcase className="h-8 w-8 text-orange-500" strokeWidth={1.5} />}
      emptyStateTitle="No Company Fit tests assigned"
      emptyStateDescription="When you generate a custom interview track, they will show up here with search, filters, and progress tracking."
      getQuestionRoute={() => "/company/practice"}
      renderQuestionMetadata={(q) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          {q.topic === "Quantitative" && <Briefcase className="w-3.5 h-3.5" />}
          {q.topic === "Logical" && <Briefcase className="w-3.5 h-3.5" />}
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
              onClick={() => setTopic("General")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all",
                topic === "General" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              General
            </button>
            <button
              onClick={() => setTopic("Stream")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all",
                topic === "Stream" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Stream Specific
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
