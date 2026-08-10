"use client";

import { Bell, Lock, Mail, MailWarning, Clock, MessageSquare, Filter, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useProgram } from "@/context/ProgramContext";
import { useState } from "react";
import { Briefcase, Building2, ExternalLink, MapPin } from "lucide-react";

// Mock job postings mapped by ProgramType
const JOB_POSTINGS = {
  "Full Stack Development": [
    {
      id: 1,
      title: "Full Stack Engineer (React/Node)",
      company: "Google",
      location: "Bangalore, India",
      type: "Full-time",
      link: "https://careers.google.com/",
      postedAt: "2 days ago",
    },
    {
      id: 2,
      title: "Frontend Developer",
      company: "Microsoft",
      location: "Hyderabad, India",
      type: "Full-time",
      link: "https://careers.microsoft.com/",
      postedAt: "1 day ago",
    },
    {
      id: 3,
      title: "Backend Engineer II",
      company: "Amazon",
      location: "Remote",
      type: "Full-time",
      link: "https://amazon.jobs/",
      postedAt: "5 hours ago",
    }
  ],
  "Data Science": [
    {
      id: 4,
      title: "Data Scientist",
      company: "Meta",
      location: "London, UK",
      type: "Full-time",
      link: "https://metacareers.com/",
      postedAt: "3 days ago",
    },
    {
      id: 5,
      title: "Data Analyst",
      company: "Netflix",
      location: "Los Gatos, CA",
      type: "Contract",
      link: "https://jobs.netflix.com/",
      postedAt: "1 day ago",
    }
  ],
  "AI and Machine Learning": [
    {
      id: 6,
      title: "Machine Learning Engineer",
      company: "OpenAI",
      location: "San Francisco, CA",
      type: "Full-time",
      link: "https://openai.com/careers",
      postedAt: "4 hours ago",
    },
    {
      id: 7,
      title: "AI Research Scientist",
      company: "DeepMind",
      location: "London, UK",
      type: "Full-time",
      link: "https://deepmind.google/about/careers/",
      postedAt: "2 days ago",
    }
  ],
  "Generative AI": [
    {
      id: 8,
      title: "Prompt Engineer",
      company: "Anthropic",
      location: "Remote",
      type: "Full-time",
      link: "https://www.anthropic.com/careers",
      postedAt: "1 day ago",
    },
    {
      id: 9,
      title: "GenAI Product Developer",
      company: "Cohere",
      location: "Toronto, Canada",
      type: "Full-time",
      link: "https://cohere.com/careers",
      postedAt: "3 hours ago",
    }
  ],
  "Competitive Coding": [
    {
      id: 10,
      title: "Software Development Engineer (SDE-1)",
      company: "Atlassian",
      location: "Sydney, Australia",
      type: "Full-time",
      link: "https://www.atlassian.com/company/careers",
      postedAt: "Just now",
    },
    {
      id: 11,
      title: "Systems Engineer",
      company: "Stripe",
      location: "Remote",
      type: "Full-time",
      link: "https://stripe.com/jobs",
      postedAt: "1 day ago",
    }
  ]
};

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { program } = useProgram();
  
  // Get jobs for current program, or an empty array
  const currentJobs = program ? JOB_POSTINGS[program as keyof typeof JOB_POSTINGS] || [] : [];

  return (
    <div className="flex-1 p-8 font-sans max-w-5xl mx-auto w-full">
      {/* Hero Section */}
      <div className="bg-card rounded-2xl p-8 mb-8 border border-border relative overflow-hidden shadow-sm">
        {/* Subtle red gradient glow on the right */}
        <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex justify-between items-end">
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 border border-blue-500/20">
              <Briefcase className="w-3 h-3" />
              Jobs & Opportunities
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">Find your next role</h1>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              Curated job postings and opportunities tailored to your selected program.
            </p>

            {/* Metrics */}
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-4 bg-background border rounded-xl px-5 py-4 min-w-[140px] text-left transition-colors cursor-pointer hover:border-foreground/20 ${activeTab === "all" ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "border-border"}`}
              >
                <div className="bg-muted p-2.5 rounded-lg shrink-0">
                  <Mail className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground leading-none">{currentJobs.length}</div>
                  <div className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-1">Total Jobs</div>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab("new-today")}
                className={`flex items-center gap-4 bg-background border rounded-xl px-5 py-4 min-w-[140px] text-left transition-colors cursor-pointer hover:border-foreground/20 ${activeTab === "new-today" ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border-border"}`}
              >
                <div className="bg-emerald-500/10 p-2.5 rounded-lg shrink-0">
                  <Briefcase className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-500 leading-none">
                    {currentJobs.filter(j => j.postedAt.includes('hour') || j.postedAt.includes('minute') || j.postedAt.includes('Just')).length}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-1">New Today</div>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab("expiring")}
                className={`flex items-center gap-4 bg-background border rounded-xl px-5 py-4 min-w-[140px] text-left transition-colors cursor-pointer hover:border-foreground/20 ${activeTab === "expiring" ? "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]" : "border-border"}`}
              >
                <div className="bg-orange-500/10 p-2.5 rounded-lg shrink-0">
                  <Clock className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-500 leading-none">0</div>
                  <div className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-1">Expiring Soon</div>
                </div>
              </button>
            </div>
          </div>

          {/* Decorative Icon Graphic */}
          <div className="hidden md:flex relative right-8 opacity-80">
            <div className="relative">
              <div className="absolute -top-4 -right-4 bg-card rounded-full p-2 border border-border z-10 shadow-lg">
                <div className="bg-foreground text-background rounded-full p-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              <div className="w-32 h-32 border-2 border-muted/30 rounded-2xl flex flex-col justify-center px-6 gap-3 bg-white/5 backdrop-blur-sm">
                <div className="w-3/4 h-2 bg-white/20 rounded-full" />
                <div className="w-full h-2 bg-white/20 rounded-full" />
                <div className="w-1/2 h-2 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <Filter className="w-4 h-4 text-muted-foreground" />
        
        <button 
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
            activeTab === "all" 
              ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
              : "bg-transparent text-muted-foreground border-border hover:border-foreground/20"
          }`}
        >
          All
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "all" ? "bg-blue-500/20" : "bg-muted"}`}>
            {currentJobs.length}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab("unread")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
            activeTab === "unread" 
              ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
              : "bg-transparent text-muted-foreground border-border hover:border-foreground/20"
          }`}
        >
          Full-Time
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "unread" ? "bg-blue-500/20" : "bg-muted"}`}>
            {currentJobs.filter(j => j.type === "Full-time").length}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab("important")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
            activeTab === "important" 
              ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
              : "bg-transparent text-muted-foreground border-border hover:border-foreground/20"
          }`}
        >
          Remote
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "important" ? "bg-blue-500/20" : "bg-muted"}`}>
            {currentJobs.filter(j => j.location.toLowerCase().includes("remote")).length}
          </span>
        </button>
      </div>

      {/* Job Postings or Empty State */}
      {currentJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentJobs.filter(j => {
            if (activeTab === "all") return true;
            if (activeTab === "unread") return j.type === "Full-time";
            if (activeTab === "important") return j.location.toLowerCase().includes("remote");
            if (activeTab === "new-today") return j.postedAt.includes('hour') || j.postedAt.includes('minute') || j.postedAt.includes('Just');
            if (activeTab === "expiring") return false; // hardcoded 0 for now
            return true;
          }).map((job) => (
            <Link 
              key={job.id} 
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card border border-border hover:border-red-500/50 rounded-2xl p-6 transition-all hover:shadow-md block"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-red-500/10 text-red-500 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {job.type}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {job.postedAt}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-red-500 transition-colors">
                {job.title}
              </h3>
              
              <div className="flex flex-col gap-2 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
              </div>
              
              <div className="mt-6 flex items-center text-sm font-semibold text-foreground group-hover:text-red-500 transition-colors">
                View Application
                <ExternalLink className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-card/50">
          <div className="bg-muted p-4 rounded-2xl mb-6">
            <Briefcase className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">No jobs available right now</h2>
          <p className="text-muted-foreground text-sm max-w-md mb-6 leading-relaxed">
            There are currently no job postings for your selected stream. Change your track or check back later!
          </p>
        </div>
      )}
    </div>
  );
}
