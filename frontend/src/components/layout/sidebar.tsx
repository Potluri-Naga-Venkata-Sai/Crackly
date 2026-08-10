"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Bell, 
  Code2, 
  LineChart, 
  ListChecks, 
  Layers, 
  MessageCircle, 
  BookOpen, 
  Briefcase, 
  Mic, 
  Server, 
  Wrench, 
  Building2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Database
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Daily Prep", href: "/daily-prep", icon: Sparkles },
  { name: "Jobs", href: "/announcements", icon: Briefcase },
  { name: "Settings", href: "/settings", icon: Wrench },
];

const assessmentItems = [
  { name: "Coding", href: "/coding", icon: Code2 },
  { name: "SQL", href: "/sql", icon: Database },
  { name: "Aptitude", href: "/aptitude", icon: LineChart },
  { name: "MCQ", href: "/mcq", icon: ListChecks },
  { name: "Mixed", href: "/mixed", icon: Layers },
  { name: "English", href: "/english", icon: MessageCircle },
  { name: "Theory", href: "/theory", icon: BookOpen },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Interview", href: "/interview", icon: Mic },
  { name: "System", href: "/system", icon: Server },
  { name: "Tools", href: "/tools", icon: Wrench },
  { name: "Company", href: "/company", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState("User");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Initial fetch
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const name = session.user.email.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    };
    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        const name = session.user.email.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      } else {
        setUserName("User");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Hide sidebar on login and landing page
  if (pathname === "/login" || pathname === "/") return null;

  return (
    <div className={cn(
      "hidden border-r border-border bg-background md:flex flex-col h-screen sticky top-0 font-sans shrink-0 transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-card border border-border rounded-full p-1 text-muted-foreground hover:text-foreground z-50 hover:bg-muted"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className="h-[72px] flex items-center px-4 border-b border-border/50 shrink-0">
        <Link href="/dashboard" prefetch={true} className="flex items-center gap-3">
          <div className="bg-primary px-3 py-1.5 rounded flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-outfit font-extrabold text-[15px] tracking-tight">INTERVIEW AI</span>
          )}
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <div className="mb-8 px-2">
          <Link href="/dashboard" prefetch={true} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-full bg-muted text-foreground flex items-center justify-center font-bold text-lg border border-border shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Welcome Back</span>
                <span className="text-[15px] font-bold text-foreground capitalize truncate max-w-[120px]">{userName}</span>
              </div>
            )}
          </Link>
        </div>

        <div className="mb-8">
          {!isCollapsed && <h3 className="px-3 mb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Menu</h3>}
          <div className="space-y-0.5">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors",
                  pathname === item.href 
                    ? "bg-red-500/10 text-foreground font-medium border border-red-500/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isCollapsed ? "justify-center px-0" : ""
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", pathname === item.href ? "text-red-500" : "text-muted-foreground")} strokeWidth={2} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            ))}
          </div>
        </div>

        <div>
          {!isCollapsed && <h3 className="px-3 mb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Assessments</h3>}
          <div className="space-y-0.5">
            {assessmentItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors",
                  pathname === item.href 
                    ? "bg-red-500/10 text-foreground font-medium border border-red-500/20 shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isCollapsed ? "justify-center px-0" : ""
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-4 w-4 shrink-0", 
                    pathname === item.href ? "text-red-500" :
                    item.name === "Coding" ? "text-blue-500" :
                    item.name === "Aptitude" ? "text-emerald-500" :
                    item.name === "MCQ" ? "text-purple-500" :
                    item.name === "Mixed" ? "text-cyan-500" :
                    item.name === "English" ? "text-rose-500" :
                    item.name === "Projects" ? "text-orange-500" :
                    item.name === "Interview" ? "text-fuchsia-500" :
                    item.name === "System" ? "text-emerald-500" :
                    item.name === "Tools" ? "text-pink-500" :
                    item.name === "Company" ? "text-orange-500" :
                    "text-muted-foreground"
                  )} strokeWidth={2} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
