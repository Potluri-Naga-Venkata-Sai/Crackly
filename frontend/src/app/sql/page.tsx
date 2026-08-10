"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Code2, Database } from "lucide-react";
import { useProgram } from "@/context/ProgramContext";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { validateResponse } from "@/lib/schemas";

export default function SQLTestsPage() {
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { program } = useProgram();

  const handleGenerate = async (onSuccess: (data: any[]) => void, onError: (err: string) => void) => {
    if (!company.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const payload: any = { company_name: company, topic: "SQL" };
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sql/generate`, {
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

      localStorage.setItem("sql_generations", (parseInt(localStorage.getItem("sql_generations") || "0") + 1).toString());
      sessionStorage.setItem("sql_track_company", company);
      sessionStorage.setItem("sql_track_topic", "SQL");
      
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
      moduleKey="sql"
      title="SQL Tests"
      description="Database querying and schema design tasks"
      icon={<Database className="h-7 w-7 text-rose-500" strokeWidth={2} />}
      iconColorClass="text-rose-500"
      iconBgClass="bg-rose-500/10 text-rose-500 border-rose-500/20"
      emptyStateIcon={<Database className="h-8 w-8 text-rose-500" strokeWidth={1.5} />}
      emptyStateTitle="No SQL tests assigned"
      emptyStateDescription="When you generate a custom interview track, they will show up here with search, filters, and progress tracking."
      getQuestionRoute={() => "/sql/practice"}
      renderQuestionMetadata={(q) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          SQL
        </span>
      )}
      renderGenerateForm={(onSuccess, onError) => (
        <div className="flex flex-col gap-3">
          <Input 
            placeholder="Enter Target Company (e.g. Meta)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="bg-card border-border h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-rose-600 rounded-xl font-medium"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate(onSuccess, onError)}
          />
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
