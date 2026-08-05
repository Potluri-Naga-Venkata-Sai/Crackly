"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2, ChevronLeft, ChevronRight, BrainCircuit, Lightbulb, MessageCircleQuestion, Target, AlertTriangle, ArrowRight, Quote } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { logActivity } from "@/lib/activity-tracker";

interface KeywordPrep {
  keyword: string;
  category: string;
  briefExplanation: string;
  realLifeExample: string;
  interviewStrategy: string;
  sampleQuestion: string;
  answerGuide: string;
  sampleAnswer: string;
}

interface PreparationData {
  overallReview: string;
  improvementTips: string[];
  jdMatchScore?: number;
  jdSuggestions?: string[];
  keywords: KeywordPrep[];
}

export function ResumeUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<"upload" | "loading" | "review" | "flashcards">("upload");
  const [prepData, setPrepData] = useState<PreparationData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStage("loading");
    setError(null);
    setPrepData(null);
    setCurrentIndex(0);
    
    const formData = new FormData();
    formData.append("file", file);
    if (jobDescription.trim()) {
      formData.append("job_description", jobDescription);
    }

    try {
      const res = await fetch("http://localhost:8000/api/resume/prepare", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to analyze resume");
      }

      const data = await res.json();
      if (data.keywords && data.keywords.length > 0) {
        setPrepData(data);
        setStage("review");
        
        logActivity({
          module: "Resume Prep",
          title: "Comprehensive Resume Analysis",
          description: `Analyzed ${file.name} and generated ${data.keywords.length} preparation flashcards.`
        });
      } else {
        throw new Error("No keywords could be extracted.");
      }
    } catch (err: any) {
      setError(err.message);
      setStage("upload");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      
      {/* Upload Phase */}
      {stage === "upload" && (
        <>
          <div 
            className={`relative w-full border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 overflow-hidden group ${
              isDragging 
                ? "border-purple-500 bg-purple-500/10 scale-[1.02] shadow-[0_0_40px_rgba(168,85,247,0.15)]" 
                : "border-white/10 hover:border-purple-500/50 hover:bg-white/5 bg-black/20"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {file ? (
              <div className="flex flex-col items-center space-y-3 relative z-10">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <p className="text-base font-bold text-white mt-4">{file.name}</p>
                <p className="text-xs font-medium text-zinc-500 bg-black/40 px-3 py-1 rounded-full">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="mt-4 text-xs hover:bg-red-500/10 hover:text-red-400 transition-colors">
                  Remove file
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3 relative z-10">
                <div className="p-5 bg-gradient-to-br from-purple-500/20 to-purple-600/5 rounded-3xl border border-purple-500/20 group-hover:scale-110 transition-transform duration-500 mb-2 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                  <Upload className="h-10 w-10 text-purple-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-white mt-4 tracking-tight">
                  Drag & drop your resume
                </h3>
                <p className="text-sm font-medium text-zinc-500">
                  PDF format, up to 5MB
                </p>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  id="resume-upload" 
                  onChange={handleFileChange}
                />
                <label htmlFor="resume-upload" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-6 cursor-pointer border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300 transition-colors font-semibold" })}>
                  Browse Files
                </label>
              </div>
            )}
          </div>

          {error && (
            <div className="w-full p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          <div className="w-full">
            <button 
              type="button" 
              onClick={() => setShowJdInput(!showJdInput)}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center mb-2"
            >
              {showJdInput ? "- Hide Job Description" : "+ Add Job Description (Optional)"}
            </button>
            {showJdInput && (
              <textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here. The AI will analyze how well your resume matches it."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-zinc-600 min-h-[100px] resize-y custom-scrollbar"
              />
            )}
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-14 text-base rounded-2xl shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] group" 
            disabled={!file}
            onClick={handleUpload}
          >
            <BrainCircuit className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Analyze & Prepare
          </Button>
        </>
      )}

      {/* Loading Phase */}
      {stage === "loading" && (
        <div className="w-full flex flex-col items-center justify-center p-12 bg-[#111111] border border-border/50 rounded-2xl animate-pulse">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Analyzing your experience...</h3>
          <p className="text-zinc-400 text-center">Extracting key skills, evaluating your resume, and generating personalized real-life scenarios.</p>
        </div>
      )}

      {/* Review Phase */}
      {stage === "review" && prepData && (
        <div className="w-full animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-[#18181b] border border-emerald-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />
            
            <h2 className="text-3xl font-black text-white mb-6">Resume Assessment</h2>
            
            <div className="bg-[#111111] border border-border/50 rounded-xl p-5 mb-6">
              <h4 className="text-sm font-bold text-emerald-400 mb-2">Overall Review</h4>
              <p className="text-zinc-300 text-[15px] leading-relaxed">{prepData.overallReview}</p>
            </div>

            <div className="bg-[#111111] border border-border/50 rounded-xl p-5 mb-8">
              <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Areas for Improvement
              </h4>
              <ul className="space-y-3">
                {prepData.improvementTips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                    <span className="text-amber-500 shrink-0 mt-0.5">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            {prepData.jdMatchScore !== undefined && prepData.jdSuggestions && (
              <div className="bg-sky-900/20 border border-sky-500/30 rounded-xl p-5 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                    <Target className="w-4 h-4" /> JD Match Analysis
                  </h4>
                  <div className="bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full text-xs font-bold border border-sky-500/20">
                    Match Score: {prepData.jdMatchScore}%
                  </div>
                </div>
                <ul className="space-y-3">
                  {prepData.jdSuggestions.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sky-100 text-sm">
                      <span className="text-sky-400 shrink-0 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              onClick={() => setStage("flashcards")}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Next: Review Skills & Keywords <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Interactive Preparation Phase */}
      {stage === "flashcards" && prepData && (
        <div className="w-full animate-in fade-in zoom-in-95 duration-500">
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Keyword Prep ({currentIndex + 1}/{prepData.keywords.length})</h3>
            <div className="flex gap-1">
              {prepData.keywords.map((_, i) => (
                <div key={i} className={cn("h-1.5 rounded-full transition-all", i === currentIndex ? "w-6 bg-purple-500" : "w-2 bg-zinc-800")} />
              ))}
            </div>
          </div>

          <div className="bg-[#18181b] border border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="inline-block bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/20 mb-4 uppercase tracking-wider">
              {prepData.keywords[currentIndex].category}
            </div>
            
            <h2 className="text-4xl font-black text-white mb-8">{prepData.keywords[currentIndex].keyword}</h2>
            
            <div className="space-y-6">
              <div className="bg-[#111111] border border-border/50 rounded-xl p-5 relative">
                <BrainCircuit className="absolute top-5 right-5 w-5 h-5 text-zinc-600" />
                <h4 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
                   Brief Explanation
                </h4>
                <p className="text-zinc-300 text-sm leading-relaxed">{prepData.keywords[currentIndex].briefExplanation}</p>
              </div>

              <div className="bg-[#111111] border border-border/50 rounded-xl p-5 relative">
                <Target className="absolute top-5 right-5 w-5 h-5 text-zinc-600" />
                <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                   Real-Life Context
                </h4>
                <p className="text-zinc-300 text-sm leading-relaxed">{prepData.keywords[currentIndex].realLifeExample}</p>
              </div>

              <div className="bg-[#111111] border border-border/50 rounded-xl p-5 relative">
                <Lightbulb className="absolute top-5 right-5 w-5 h-5 text-zinc-600" />
                <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                   Your Strategy
                </h4>
                <p className="text-zinc-300 text-sm leading-relaxed">{prepData.keywords[currentIndex].interviewStrategy}</p>
              </div>

              <div className="bg-[#111111] border border-border/50 rounded-xl p-5 relative">
                <MessageCircleQuestion className="absolute top-5 right-5 w-5 h-5 text-zinc-600" />
                <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                   Sample Question
                </h4>
                <p className="text-white font-medium italic mb-4">"{prepData.keywords[currentIndex].sampleQuestion}"</p>
                
                <h4 className="text-sm font-bold text-zinc-400 mb-2 flex items-center gap-2">
                   How to Answer
                </h4>
                <p className="text-zinc-300 text-sm leading-relaxed mb-4">{prepData.keywords[currentIndex].answerGuide}</p>

                <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-4 relative">
                  <Quote className="absolute top-4 left-4 w-4 h-4 text-purple-500/30" />
                  <p className="text-purple-100 text-sm italic pl-6 leading-relaxed">
                    {prepData.keywords[currentIndex].sampleAnswer}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <Button 
                variant="outline" 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="bg-transparent border-border hover:bg-zinc-800"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              
              {currentIndex < prepData.keywords.length - 1 ? (
                <Button 
                  onClick={() => setCurrentIndex(prev => Math.min(prepData.keywords.length - 1, prev + 1))}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Link href="/interview?start=true&company=Resume&role=Keyword_Prep">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                    Start Mock Interview <Target className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
