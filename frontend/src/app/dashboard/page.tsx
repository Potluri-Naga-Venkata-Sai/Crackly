"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { 
  ArrowRight, 
  Target, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Code2, 
  LineChart, 
  ListChecks, 
  Layers, 
  MessageCircle, 
  BookOpen, 
  Briefcase, 
  Mic,
  Activity
} from "lucide-react";
import { ResumeUpload } from "@/components/resume-upload";
import { getActivities, ActivityLog } from "@/lib/activity-tracker";
import { getBookmarks, Bookmark } from "@/lib/bookmark-tracker";
import { formatDistanceToNow } from "date-fns";
import { Bookmark as BookmarkIcon, Play, Send, Bot, Database, Paperclip, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export default function DashboardPage() {
  const [userName, setUserName] = useState("User");
  const [challengeData, setChallengeData] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeTab, setActiveTab] = useState<"activity" | "saved">("activity");
  const [pendingCounts, setPendingCounts] = useState({
    coding: 0,
    aptitude: 0,
    mcq: 0,
    mixed: 0,
    english: 0,
    theory: 0,
    projects: 0,
    system: 0,
    tools: 0,
    company: 0,
    sql: 0,
    interviews: 0
  });

  const [chatPrompt, setChatPrompt] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatFile, setChatFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setUserName(session.user.email.split("@")[0]);
        }
        const userId = session?.user?.id || "anonymous";

        const res = await fetch(`http://localhost:8000/api/challenge/progress/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setChallengeData(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    
    fetchDashboardData();
    setRecentActivities(getActivities().slice(0, 10)); // only show the last 10 activities
    setBookmarks(getBookmarks());

    const updatePendingCounts = () => {
      const getCount = (key) => {
        return parseInt(localStorage.getItem(key) || "0");
      };
      
      setPendingCounts({
        coding: getCount("coding_completed_tracks"),
        aptitude: getCount("aptitude_completed_tracks"),
        mcq: getCount("mcq_completed_tracks"),
        mixed: (() => {
          try {
            const arr = JSON.parse(localStorage.getItem("mixed_history") || "[]");
            return Array.isArray(arr) ? arr.length : 0;
          } catch(e) { return 0; }
        })(),
        english: getCount("english_completed_tracks"),
        theory: getCount("theory_completed_tracks"),
        projects: getCount("projects_completed_tracks"),
        system: getCount("system_completed_tracks"),
        tools: getCount("tools_completed_tracks"),
        company: getCount("company_completed_tracks"),
        sql: getCount("sql_completed_tracks"),
        interviews: (() => {
          try {
            const arr = JSON.parse(localStorage.getItem("interview_history") || "[]");
            return Array.isArray(arr) ? arr.length : 0;
          } catch(e) { return 0; }
        })()
      });
    };


    updatePendingCounts();

    const handleStorageChange = () => {
      setRecentActivities(getActivities().slice(0, 10));
      setBookmarks(getBookmarks());
      updatePendingCounts();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleResumeBookmark = (bm: Bookmark) => {
    sessionStorage.setItem(
      bm.module === "Aptitude" ? "current_aptitude_problem" :
      bm.module === "Coding" ? "current_coding_problem" : 
      "current_subjective_problem", 
      JSON.stringify(bm.problemData)
    );
  };

  const challengeDay = challengeData?.current_day || 1;
  const progressPercent = Math.round((challengeDay / 30) * 100);

  const handleAskBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;
    
    setIsChatLoading(true);
    setChatResponse("");
    
    const formData = new FormData();
    formData.append("prompt", chatPrompt);
    if (chatFile) {
      formData.append("file", chatFile);
    }

    try {
      const res = await fetch("http://localhost:8000/api/chat/ask", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setChatResponse(data.answer);
        setChatPrompt(""); // Clear input on success
        setChatFile(null); // Clear file
      } else {
        setChatResponse("Error: Could not fetch response.");
      }
    } catch (error) {
      setChatResponse("Error: Network issue.");
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 font-sans max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <div className="bg-card rounded-2xl p-8 mb-8 border border-border flex flex-col md:flex-row gap-8 items-stretch shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase mb-3">Your Learning Space</p>
          <h1 className="text-4xl font-bold text-foreground mb-4 capitalize tracking-tight">Hello, {userName}</h1>
          <p className="text-muted-foreground text-sm max-w-lg mb-6 leading-relaxed">
            Track your progress, pick up where you left off, and jump into any interview module from the sidebar.
          </p>
          <Button 
            onClick={() => {
              const el = document.getElementById("modules");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-fit bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-foreground font-semibold px-6 py-6 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:scale-105 active:scale-95 text-[15px]"
          >
            Browse modules
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* AI Bot Widget */}
        <div className="flex-1 bg-background/50 backdrop-blur-xl rounded-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden relative min-h-[220px]">
          <div className="bg-blue-500/10 p-3 px-4 border-b border-white/5 flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <h3 className="font-bold text-sm text-zinc-100">AI Mentor</h3>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar text-sm text-muted-foreground max-h-[200px]">
            {isChatLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <div className="w-2 h-2 bg-blue-500 rounded-full" /> Thinking...
              </div>
            ) : chatResponse ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{chatResponse}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground italic mt-2 text-center text-xs">Ask me anything about programming, tools, or interview prep!</p>
            )}
          </div>

          <form onSubmit={handleAskBot} className="p-3 bg-black/20 border-t border-white/5 flex flex-col gap-2">
            {chatFile && (
              <div className="flex items-center justify-between bg-white/10 rounded-md px-3 py-1.5 text-xs text-muted-foreground">
                <span className="truncate max-w-[200px]">{chatFile.name}</span>
                <button type="button" onClick={() => setChatFile(null)} className="hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-border rounded-lg p-2 flex items-center justify-center transition-colors text-muted-foreground">
                <Paperclip className="w-4 h-4" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.txt,.md,.json" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setChatFile(e.target.files[0]);
                    }
                  }} 
                />
              </label>
              <input 
                type="text" 
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                placeholder="E.g. What are React hooks?" 
                className="flex-1 bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-muted-foreground"
              />
              <button 
                type="submit" 
                disabled={isChatLoading || !chatPrompt.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-foreground p-2 rounded-lg transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div id="modules" className="mb-6 pt-4">
        <h2 className="text-xl font-bold text-foreground mb-1">Explore Practice Modules</h2>
        <p className="text-sm text-muted-foreground">Select a category to start your interview preparation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Link href="/coding" className="block outline-none">
          <div className="bg-card border border-border rounded-xl p-5 hover:bg-muted transition-colors cursor-pointer group h-full">
            <div className="bg-blue-500/10 p-2.5 rounded-lg w-fit mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Code2 className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Coding Tests</h3>
            <p className="text-xs text-muted-foreground mb-6">DSA practice and code-based tasks</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-foreground">{pendingCounts.coding}</span>
              <span className="text-xs text-muted-foreground font-medium">generated</span>
            </div>
          </div>
        </Link>

        <Link href="/aptitude" className="block outline-none">
          <div className="bg-card border border-border rounded-xl p-5 hover:bg-muted transition-colors cursor-pointer group h-full">
            <div className="bg-emerald-500/10 p-2.5 rounded-lg w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <LineChart className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Aptitude Tests</h3>
            <p className="text-xs text-muted-foreground mb-6">Quantitative, logical and analytical</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-foreground">{pendingCounts.aptitude}</span>
              <span className="text-xs text-muted-foreground font-medium">generated</span>
            </div>
          </div>
        </Link>

        <Link href="/mcq" className="block outline-none">
          <div className="bg-card border border-border rounded-xl p-5 hover:bg-muted transition-colors cursor-pointer group h-full">
            <div className="bg-purple-500/10 p-2.5 rounded-lg w-fit mb-4 group-hover:bg-purple-500/20 transition-colors">
              <ListChecks className="h-5 w-5 text-purple-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">MCQ Tests</h3>
            <p className="text-xs text-muted-foreground mb-6">Objective questions with instant checks</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-foreground">{pendingCounts.mcq}</span>
              <span className="text-xs text-muted-foreground font-medium">generated</span>
            </div>
          </div>
        </Link>

        <Link href="/mixed" className="block outline-none">
          <div className="bg-card border border-border rounded-xl p-5 hover:bg-muted transition-colors cursor-pointer group h-full">
            <div className="bg-cyan-500/10 p-2.5 rounded-lg w-fit mb-4 group-hover:bg-cyan-500/20 transition-colors">
              <Layers className="h-5 w-5 text-cyan-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Mixed Tests</h3>
            <p className="text-xs text-muted-foreground mb-6">Combination of multiple question types</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-foreground">{pendingCounts.mixed}</span>
              <span className="text-xs text-muted-foreground font-medium">generated</span>
            </div>
          </div>
        </Link>

        <Link href="/english" className="block outline-none">
          <div className="bg-card border border-border rounded-xl p-5 hover:bg-muted transition-colors cursor-pointer group h-full">
            <div className="bg-rose-500/10 p-2.5 rounded-lg w-fit mb-4 group-hover:bg-rose-500/20 transition-colors">
              <MessageCircle className="h-5 w-5 text-rose-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">English Tests</h3>
            <p className="text-xs text-muted-foreground mb-6">Grammar, vocabulary, reading, writing</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-foreground">{pendingCounts.english}</span>
              <span className="text-xs text-muted-foreground font-medium">generated</span>
            </div>
          </div>
        </Link>

        <Link href="/theory" className="block outline-none">
          <div className="bg-card border border-border rounded-xl p-5 hover:bg-muted transition-colors cursor-pointer group h-full">
            <div className="bg-zinc-500/10 p-2.5 rounded-lg w-fit mb-4 group-hover:bg-zinc-500/20 transition-colors">
              <BookOpen className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Theory Tests</h3>
            <p className="text-xs text-muted-foreground mb-6">Theory and conceptual questions</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-foreground">{pendingCounts.theory}</span>
              <span className="text-xs text-muted-foreground font-medium">generated</span>
            </div>
          </div>
        </Link>

        <Link href="/projects" className="block outline-none">
          <div className="bg-card border border-border rounded-xl p-5 hover:bg-muted transition-colors cursor-pointer group h-full">
            <div className="bg-orange-500/10 p-2.5 rounded-lg w-fit mb-4 group-hover:bg-orange-500/20 transition-colors">
              <Briefcase className="h-5 w-5 text-orange-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Project Evaluation</h3>
            <p className="text-xs text-muted-foreground mb-6">AI-based project review and scoring</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-foreground">{pendingCounts.projects}</span>
              <span className="text-xs text-muted-foreground font-medium">generated</span>
            </div>
          </div>
        </Link>

        <Link href="/interview" className="block outline-none">
          <div className="bg-card border border-border rounded-xl p-5 hover:bg-muted transition-colors cursor-pointer group h-full">
            <div className="bg-fuchsia-500/10 p-2.5 rounded-lg w-fit mb-4 group-hover:bg-fuchsia-500/20 transition-colors">
              <Mic className="h-5 w-5 text-fuchsia-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Mock Interview</h3>
            <p className="text-xs text-muted-foreground mb-6">Chat-based mock interview simulator</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-foreground">{pendingCounts.interviews}</span>
              <span className="text-xs text-muted-foreground font-medium">generated</span>
            </div>
          </div>
        </Link>

        <Link href="/system" className="block outline-none">
          <div className="bg-card border border-border rounded-xl p-5 hover:bg-muted transition-colors cursor-pointer group h-full">
            <div className="bg-emerald-500/10 p-2.5 rounded-lg w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <Layers className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">System Design</h3>
            <p className="text-xs text-muted-foreground mb-6">HLD and LLD architecture practice</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-foreground">{pendingCounts.system}</span>
              <span className="text-xs text-muted-foreground font-medium">generated</span>
            </div>
          </div>
        </Link>

        <Link href="/tools" className="block outline-none">
          <div className="bg-card border border-border rounded-xl p-5 hover:bg-muted transition-colors cursor-pointer group h-full">
            <div className="bg-pink-500/10 p-2.5 rounded-lg w-fit mb-4 group-hover:bg-pink-500/20 transition-colors">
              <ListChecks className="h-5 w-5 text-pink-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Developer Tools</h3>
            <p className="text-xs text-muted-foreground mb-6">Git, Docker, Kubernetes, AWS</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-foreground">{pendingCounts.tools}</span>
              <span className="text-xs text-muted-foreground font-medium">generated</span>
            </div>
          </div>
        </Link>

        <Link href="/sql" className="block outline-none">
          <div className="bg-card border border-border rounded-xl p-5 hover:bg-muted transition-colors cursor-pointer group h-full">
            <div className="bg-sky-500/10 p-2.5 rounded-lg w-fit mb-4 group-hover:bg-sky-500/20 transition-colors">
              <Database className="h-5 w-5 text-sky-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">SQL Tests</h3>
            <p className="text-xs text-muted-foreground mb-6">Database querying and schemas</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-foreground">{pendingCounts.sql}</span>
              <span className="text-xs text-muted-foreground font-medium">generated</span>
            </div>
          </div>
        </Link>

        <Link href="/company" className="block outline-none">
          <div className="bg-card border border-border rounded-xl p-5 hover:bg-muted transition-colors cursor-pointer group h-full">
            <div className="bg-orange-500/10 p-2.5 rounded-lg w-fit mb-4 group-hover:bg-orange-500/20 transition-colors">
              <Briefcase className="h-5 w-5 text-orange-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Company Fit</h3>
            <p className="text-xs text-muted-foreground mb-6">Behavioral and leadership principles</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-foreground">{pendingCounts.company}</span>
              <span className="text-xs text-muted-foreground font-medium">generated</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Resume Upload - Moved below modules */}
      <div className="mt-12 w-full">
        <div className="mb-4 flex items-center gap-4">
          <div className="bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <BookOpen className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-0.5 tracking-tight">AI Resume Preparation</h2>
            <p className="text-xs text-muted-foreground">Generate a custom interview track instantly from your CV.</p>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative z-10 w-full max-w-2xl">
            <ResumeUpload />
          </div>
        </div>
      </div>

      <div className="mt-12 w-full">
        <div className="w-full">
          <div className="mb-6 flex items-center gap-4 border-b border-border/40 pb-4">
            <button 
              onClick={() => setActiveTab("activity")}
              className={cn("text-lg font-bold transition-all px-4 py-2 rounded-xl", activeTab === "activity" ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-muted-foreground hover:bg-white/5")}
            >
              Recent Activity
            </button>
            <button 
              onClick={() => setActiveTab("saved")}
              className={cn("text-lg font-bold transition-all px-4 py-2 rounded-xl flex items-center gap-2", activeTab === "saved" ? "bg-orange-500/10 text-orange-400 shadow-sm" : "text-muted-foreground hover:text-muted-foreground hover:bg-white/5")}
            >
              Saved Items
              {bookmarks.length > 0 && (
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-black", activeTab === "saved" ? "bg-orange-500 text-foreground" : "bg-muted text-muted-foreground")}>{bookmarks.length}</span>
              )}
            </button>
          </div>
          <div className="bg-card border border-border/50 rounded-3xl p-6 h-fit max-h-[600px] overflow-y-auto custom-scrollbar shadow-xl">
            {activeTab === "activity" ? (
              recentActivities.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Activity className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No recent activity found.</p>
                  <p className="text-xs mt-1">Take a test or interview to see it here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentActivities.map((act) => (
                    <div key={act.id} className="flex gap-4 relative">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 z-10 relative shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <div className="w-[1px] h-full bg-border/50 absolute top-4 bottom-[-1.5rem]" />
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">{act.module}</span>
                          <span className="text-[11px] text-muted-foreground font-medium">{formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}</span>
                        </div>
                        <h4 className="text-[15px] font-bold text-foreground leading-snug">{act.title}</h4>
                        {act.description && <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{act.description}</p>}
                        {act.score && (
                          <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                            Score: {act.score}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              bookmarks.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <BookmarkIcon className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No saved items found.</p>
                  <p className="text-xs mt-1">Bookmark difficult problems to review them here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookmarks.map((bm) => (
                    <Link 
                      key={bm.id} 
                      href={bm.path}
                      onClick={() => handleResumeBookmark(bm)}
                      className="block p-5 rounded-2xl border border-white/5 bg-card/50 hover:bg-card hover:border-border transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded-md">{bm.module}</span>
                        <span className="text-[11px] text-muted-foreground font-medium">{formatDistanceToNow(new Date(bm.timestamp))} ago</span>
                      </div>
                      <h4 className="text-[15px] font-bold text-zinc-100 mb-3 leading-snug group-hover:text-orange-400 transition-colors">{bm.title}</h4>
                      <div className="flex items-center gap-2">
                        {bm.difficulty && (
                          <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border",
                            bm.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            bm.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                            "bg-red-500/10 text-red-500 border-red-500/20"
                          )}>
                            {bm.difficulty}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto group-hover:text-foreground transition-colors">
                          <Play className="w-3 h-3" /> Resume Practice
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
