"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Brain, Target, MessageSquare, TrendingUp, CheckCircle, XCircle, AlertCircle, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Cell, Pie, PieChart } from "recharts";

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("interview_history");
    if (saved) {
      const history = JSON.parse(saved);
      const current = history.find((h: any) => h.id === params.id);
      if (current) setReport(current);
    }
  }, [params.id]);

  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-muted">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your report...</p>
      </div>
    );
  }

  const { feedback } = report;
  const radarData = [
    { subject: 'Correctness', A: feedback.skills.correctness, fullMark: 100 },
    { subject: 'Tech Depth', A: feedback.skills.technicalDepth, fullMark: 100 },
    { subject: 'Communication', A: feedback.skills.communication, fullMark: 100 },
    { subject: 'Confidence', A: feedback.skills.confidence, fullMark: 100 },
    { subject: 'Relevance', A: feedback.skills.relevance, fullMark: 100 },
  ];

  const pieData = [
    { name: 'Readiness', value: feedback.readiness, color: '#d946ef' }, // purple/pink
    { name: 'Remaining', value: 100 - feedback.readiness, color: '#27272a' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-muted font-sans pb-24 h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto p-8">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push('/interview')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Feedback Report</h1>
            <p className="text-muted-foreground">{report.role} at {report.company} • {new Date(report.date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Top Banner (Room to grow) */}
        <div className="bg-card border border-border/50 rounded-2xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-sm font-bold border border-purple-500/20 mb-4">
              <Sparkles className="w-4 h-4" /> Room to grow
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">Keep practicing!</h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              You're making progress. Focus on your technical depth and expanding on your answers. Review the detailed feedback below to target your weak spots.
            </p>
          </div>

          <div className="flex gap-8 items-center bg-background p-6 rounded-2xl border border-border/50">
            {/* Score */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground font-medium mb-1">Overall Score</p>
              <div className="text-5xl font-black text-foreground">{feedback.overallScore}<span className="text-2xl text-zinc-600">/{feedback.maxScore}</span></div>
            </div>
            
            <div className="w-px h-16 bg-border/50" />
            
            {/* Readiness Ring Chart */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={34} outerRadius={46} paddingAngle={0} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-foreground leading-none">{feedback.readiness}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Executive Summary */}
          <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Executive summary</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              {feedback.executiveSummary}
            </p>
            
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
              <div className="bg-background p-4 rounded-xl border border-border/50">
                <div className="text-2xl font-bold text-foreground mb-1">{feedback.questions.length}</div>
                <div className="text-sm text-muted-foreground font-medium">Questions asked</div>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border/50">
                <div className="text-2xl font-bold text-emerald-400 mb-1">{feedback.strongAnswers}</div>
                <div className="text-sm text-muted-foreground font-medium">Strong answers</div>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border/50">
                <div className="text-2xl font-bold text-red-400 mb-1">{feedback.needPractice}</div>
                <div className="text-sm text-muted-foreground font-medium">Need practice</div>
              </div>
            </div>
          </div>

          {/* Skill Profile (Radar Chart) */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-6">Skill Profile</h3>
            <div className="flex-1 w-full h-[250px] relative -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#3f3f46" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Skills" dataKey="A" stroke="#d946ef" strokeWidth={2} fill="#d946ef" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Improvements & Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> What you did well
            </h3>
            <ul className="space-y-3">
              {feedback.whatYouDidWell.map((item: string, i: number) => (
                <li key={i} className="flex gap-3 text-muted-foreground text-[15px]">
                  <span className="text-emerald-500 shrink-0 mt-1">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <TrendingUp className="text-amber-500 w-5 h-5" /> Where to improve
            </h3>
            <ul className="space-y-3">
              {feedback.whereToImprove.map((item: string, i: number) => (
                <li key={i} className="flex gap-3 text-muted-foreground text-[15px]">
                  <span className="text-amber-500 shrink-0 mt-1">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-400" /> Focus next
            </h3>
            <div className="flex flex-wrap gap-2">
              {feedback.focusNext.map((item: string, i: number) => (
                <div key={i} className="bg-muted text-foreground px-4 py-2 rounded-lg text-sm border border-border/50">
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-purple-400" /> Learning resources
            </h3>
            <div className="space-y-2">
              {feedback.learningResources.map((res: any, i: number) => (
                <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="block bg-background hover:bg-card border border-border/50 hover:border-purple-500/30 p-3 rounded-lg text-sm text-muted-foreground transition-colors">
                  {res.title} <span className="text-purple-400 ml-1">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Question by Question Review */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Question-by-question review</h2>
          <div className="space-y-4">
            {feedback.questions.map((q: any, i: number) => (
              <div key={i} className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground leading-snug">{q.question}</h4>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      q.status.toLowerCase().includes("work") ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      q.status.toLowerCase().includes("strong") ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      q.status.toLowerCase().includes("fair") ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {q.status}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">Score: <span className="text-foreground">{q.score}</span>/{q.maxScore}</div>
                  </div>
                </div>
                
                <div className="bg-background rounded-xl p-4 border border-border/50 ml-11">
                  <div className="flex gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-bold text-muted-foreground">Your Answer & Feedback</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                    {q.userAnswer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
